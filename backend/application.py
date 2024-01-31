from flask import Flask, request, jsonify
import requests
import json
import sys
from ebay_oauth_token import OAuthToken
client_id = "ChiTingH-firstApp-PRD-672bbdc3d-c7a8127b"
client_secret = "PRD-72bbdc3d30b3-d3b3-4e67-a244-f131"
oauth_utility = OAuthToken(client_id, client_secret) 
application_token = oauth_utility.getApplicationToken()



application = Flask(__name__, static_url_path='')
user_list = []


@application.route('/single_item', methods=['GET'])
def single_item():
    
    headers = {
        "X-EBAY-API-IAF-TOKEN": oauth_utility.getApplicationToken()
    }
    itemId_value = request.args.get('itemId')
    get_single_item_url = f"https://open.api.ebay.com/shopping?callname=GetSingleItem&responseencoding=JSON&appid=ChiTingH-firstApp-PRD-672bbdc3d-c7a8127b&siteid=0&version=967&ItemID={itemId_value}&IncludeSelector=Description,Details,ItemSpecifics"  # Replace with the actual eBay endpoint URL.
    # print("get_single_item_url: ", get_single_item_url,"\n")
    
    response = requests.get(get_single_item_url, headers=headers)
    
    if response.status_code == 200:
        # print(response.json())
        return jsonify(response.json()) 
    else:
        return jsonify({"error": "Failed to fetch data from eBay"}), 500


def get_conditions():
    conditions = []
    index = 0

    key = f'itemFilter(2).value({index})'
    value = request.args.get(key)

    while value:
        conditions.append(value)
        
        index += 1
        key = f'itemFilter(2).value({index})'
        value = request.args.get(key)
    
    return conditions


@application.route("/")
def index():
    return application.send_static_file("index.html")

@application.route('/search', methods=['GET'])
def search_items():
    keyword = request.args.get('keywords')
    if not keyword:
        url = "https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=ChiTingH-firstApp-PRD-672bbdc3d-c7a8127b&RESPONSE-DATA-FORMAT=JSON&keywords=iphone&paginationInput.entriesPerPage=10&sortOrder=BestMatch&itemFilter(0).name=MaxPrice&itemFilter(0).value=25&itemFilter(0).paramName=Currency&itemFilter(0).paramValue=USD"
        result = requests.get(url)
        data = result.json()
        return data

    else:
        print("request.args: ", request.args,"\n")
        keyword = request.args.get('keywords')
        sort_order = request.args.get('sortOrder')
        max_price = request.args.get('itemFilter(0).name')
        max_price_value = request.args.get('itemFilter(0).value')
        min_price = request.args.get('itemFilter(1).name')
        min_price_value = request.args.get('itemFilter(1).value')
        condition = request.args.get('itemFilter(2).name')
        seller = request.args.get('itemFilter(3).name')
        seller_value = request.args.get('itemFilter(3).value')
        free = request.args.get('itemFilter(4).name')
        free_value = request.args.get('itemFilter(4).value')
        expedited = request.args.get('itemFilter(5).name')
        expedited_value = request.args.get('itemFilter(5).value')
        
        # condition_value = request.args.get('itemFilter(2).value(0)')
        entries_per_page = request.args.get('paginationInput.entriesPerPage')
        timestamp =  request.args.get('_')

        print("max_price_value:", max_price_value,"\n");
        # print("expedited_value:", expedited_value,"\n");

        params = {
            'OPERATION-NAME': 'findItemsAdvanced',
            'SERVICE-VERSION': '1.0.0',
            'SECURITY-APPNAME': 'ChiTingH-firstApp-PRD-672bbdc3d-c7a8127b',
            'RESPONSE-DATA-FORMAT': 'JSON',
            'REST-PAYLOAD': None,
            'keywords': keyword,
            'paginationInput.entriesPerPage': entries_per_page,
            'sortOrder': sort_order,
            '_': timestamp
        }

        item_filter_counter = 0  

        if max_price and max_price_value and max_price_value != "":
            params[f'itemFilter({item_filter_counter}).name'] = max_price
            params[f'itemFilter({item_filter_counter}).value'] = max_price_value
            item_filter_counter += 1  
            
        if min_price and min_price_value and min_price_value != "":
            params[f'itemFilter({item_filter_counter}).name'] = min_price
            params[f'itemFilter({item_filter_counter}).value'] = min_price_value
            item_filter_counter += 1  

        if seller and seller_value and seller_value !="null":
            params[f'itemFilter({item_filter_counter}).name'] = seller
            params[f'itemFilter({item_filter_counter}).value'] = seller_value
            item_filter_counter += 1  
        
        if free and free_value and free_value !="null":
            params[f'itemFilter({item_filter_counter}).name'] = free
            params[f'itemFilter({item_filter_counter}).value'] = free_value
            item_filter_counter += 1  


        # “Check if data is null then do not return the params” prompt (20 line). ChatGPT, 20 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
        conditions = get_conditions() 

        if condition and conditions:
            params[f'itemFilter({item_filter_counter}).name'] = condition
            for i, cond in enumerate(conditions):
                params[f'itemFilter({item_filter_counter}).value({i})'] = cond
            item_filter_counter += 1  

        base_url = "https://svcs.ebay.com/services/search/FindingService/v1"
        
        query_string = '&'.join(f"{k}={v}" for k, v in params.items() if v and v != "null" and v != "undefined")
        
        url = f"{base_url}?{query_string}"

        # “How to add {value} inside the url” prompt (10 line). ChatGPT, 20 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.

        # url = f"https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=ChiTingH-firstApp-PRD-672bbdc3d-c7a8127b&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&keywords={keyword}&paginationInput.entriesPerPage={entries_per_page}&sortOrder={sort_order}&itemFilter(0).name={max_price}&itemFilter(0).value={max_price_value}&itemFilter(1).name={min_price}&itemFilter(1).value={min_price_value}&itemFilter(2).name={condition}&_={timestamp}"
        # print("url:", url,"\n");
        result = requests.get(url)
        data = result.json()

        print("url:" , url)
        # print("result:" , result)
        print("data:" , data)
        # print("---------------------------")

        total_results_found = data["findItemsAdvancedResponse"][0]["paginationOutput"][0]["totalEntries"]

        # if total_results_found>0:
            
            # print(result.json())
            # response_data = result.json()
        item_json = {
            "total_results_found": 0,
        }

        try:
            total_results_found = int(data['findItemsAdvancedResponse'][0]['paginationOutput'][0]['totalEntries'][0])
            if total_results_found > 0:
                itemName = [item["title"][0] for item in data["findItemsAdvancedResponse"][0]["searchResult"][0]["item"]]
                itemId = [item["itemId"][0] for item in data["findItemsAdvancedResponse"][0]["searchResult"][0]["item"]]
                image_urls = [item["galleryURL"][0] for item in data["findItemsAdvancedResponse"][0]["searchResult"][0]["item"]]
                ebay_links = [item["viewItemURL"][0] for item in data["findItemsAdvancedResponse"][0]["searchResult"][0]["item"]]
                item_categories = [item["primaryCategory"][0]["categoryName"][0] for item in data["findItemsAdvancedResponse"][0]["searchResult"][0]["item"]]
                item_categories_id = [item["primaryCategory"][0]["categoryId"][0] for item in data["findItemsAdvancedResponse"][0]["searchResult"][0]["item"]]
                # item_conditions = [item["condition"][0]["conditionDisplayName"][0] for item in data["findItemsAdvancedResponse"][0]["searchResult"][0]["item"]]
                top_rated_images = [item["topRatedListing"][0] for item in data["findItemsAdvancedResponse"][0]["searchResult"][0]["item"]]
                item_prices = [item["sellingStatus"][0]["convertedCurrentPrice"][0]["__value__"] for item in data["findItemsAdvancedResponse"][0]["searchResult"][0]["item"]]

                total_results_found = int(data['findItemsAdvancedResponse'][0]['paginationOutput'][0]['totalEntries'][0])
                item_conditions = []

                if total_results_found > 0:
                    for item in data["findItemsAdvancedResponse"][0]["searchResult"][0]["item"]:
                        if "condition" in item:
                            condition = item["condition"][0]["conditionDisplayName"][0]
                        else:
                            condition = "No Condition Specified"
                        item_conditions.append(condition)

                for item_condition in item_conditions:
                    print(f"Item: {item_condition[0]}, Condition: {item_condition[1]}")


                
                # test = [item["shippingInfo"][0]["shippingServiceCost"][0]["__value__"]for item in data["findItemsAdvancedResponse"][0]["searchResult"][0]["item"]]
                shipping_costs = []
                for item in data["findItemsAdvancedResponse"][0]["searchResult"][0]["item"]:
                    shipping_cost = item.get("shippingInfo", [{}])[0].get("shippingServiceCost", [{}])[0].get("__value__", "N/A")
                    shipping_costs.append(shipping_cost)
            
                # print("test",test)
                # print("---------------------------")
                # item_shipping_costs = [item["shippingInfo"][0]["shippingServiceCost"][0]["__value__"] for item in data["findItemsAdvancedResponse"][0]["searchResult"][0]["item"]]

                print("Item Title:", itemName)
                print("Item Id:", itemId)
                print("Total Results Found:", total_results_found)
                print("Image URLs:", image_urls)
                print("eBay Links:", ebay_links)
                print("Item Categories:", item_categories)
                print("Item Conditions:", item_conditions)
                print("Top Rated Images:", top_rated_images)
                print("Item Prices:", item_prices)
                print("shipping cost",shipping_costs)
                # print("Item Shipping Costs:", item_shipping_costs)

            

                item_data = {
                    "itemName": itemName,
                    "itemId": itemId,
                    "total_results_found": total_results_found,
                    "image_urls": image_urls,
                    "ebay_links": ebay_links,
                    "item_categories": item_categories,
                    "item_categories_id": item_categories_id,
                    "item_conditions": item_conditions,
                    "top_rated_images": top_rated_images,
                    "item_prices": item_prices,
                    "item_shipping_costs": shipping_costs,
                }
                # "item_shipping_costs": shipping_costs,
                item_json = json.dumps(item_data)
        except Exception as e:
            print(f"Error occurred: {e}")


    return item_json

@application.errorhandler(500)
def internal_error(error):
    return "Internal server error occurred. Please try again later.", 500




if __name__ == "__main__":
    application.run()
