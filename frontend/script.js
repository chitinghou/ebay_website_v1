// Replace 'http://yourserver' with the actual URL of your Flask app
const baseUrl = 'http://127.0.0.1:5000/';
//const baseUrl = 'http://testapp-env.eba-uejcwitu.us-east-1.elasticbeanstalk.com/';


// Replace 'search' with the actual route you defined in Flask

const route = '/search';

var jsonQueryParams;
var queryParams = {};
var keywords;
console.log("first: "+queryParams);


const more_button = document.createElement("button");
more_button.id = "more_button";
more_button.textContent = "Show more";

const less_button = document.createElement("button");
less_button.id = "less_button";
less_button.textContent = "Show less";

const item_Part = document.createElement("div");
item_Part.id = "item_part";


// Make the GET request to your Flask API
var container;
var item_container;
let initial_show = 3;
var data;
var data_set;

function search(){
    container = document.getElementById("data-container");
    
    const url = new URL(route, baseUrl);
    Object.keys(queryParams).forEach((key) => {
        console.log("key:"+ key+ "value:"+queryParams[key]);
        url.searchParams.append(key, queryParams[key]);
    });
    // “How to send data to Python Flask with name and value” prompt (3 line). ChatGPT, 15 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
    fetch(url)
    .then((response) => response.json())
    .then((data) => {
        container.innerHTML = "";
        queryParams = {};
        console.log("data: ",data);
        data_set = data;
        
        if(data.total_results_found ==0){
            const no_result = document.createElement("h2");
            no_result.innerHTML = `No Results found`;
            container.appendChild(no_result);
        }else{
            const result = document.createElement("h2");
            result.id = "result";
            result.innerHTML = `${data.total_results_found} Results found for <i>${keywords}</i>`;
            container.appendChild(result);

            item_container = document.createElement("div");
            item_container.id = "item_container";

            for (let i = 0; i < initial_show; i++) {
                const itemDiv = document.createElement("div");
                itemDiv.classList.add("item");

                //“How to create html tag inside JS” prompt (2 line). ChatGPT, 15 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.

                const img_div = document.createElement("div");
                img_div.classList.add("img_div");

                const itemImg = document.createElement("img");
                console.log("data.image_urls[i]'s type: ", typeof data.image_urls[i]);
                if(data.image_urls[i]){
                    itemImg.src = data.image_urls[i];
                }else{
                    itemImg.src = "./images/ebay_default.jpg";
                }
                itemImg.id = "itemImg";
                

                const itemDescript = document.createElement("div");
                itemDescript.classList.add("item_description");

                const itemName = document.createElement("h3");
                itemName.textContent = data.itemName[i];

                const itemId = data.itemId[i];
                //console.log("itemId: ", itemId);

                itemDiv.addEventListener('click', function() {
                    container.style.display = 'none';
                    fetchItemDetails(itemId);  
                });

                const itemCategorySpan = document.createElement("span");
                itemCategorySpan.id = "itemCategorySpan";

                const itemCategory = document.createElement("p");
                itemCategory.textContent = "Category: " + data.item_categories[i];
                itemCategory.id = "itemCategory";
                

                var categories_id = data.item_categories_id[i];
                const link = document.createElement("a");
                var s= data.item_categories[i].replace(/ & /g, '-')
                s = s.replace(/&/g, '-').replace(/ /g, '-');
                link.href = "https://www.ebay.com/b/" + s + "/" + categories_id;
                //("link.href: ", link.href);

                const itemCategoryImg = document.createElement("img");
                itemCategoryImg.src = "./images/redirect.png";
                itemCategoryImg.id = "itemCategoryImg";
                link.appendChild(itemCategoryImg);

                itemCategoryImg.addEventListener("click", function(event) {
                    event.stopPropagation();
                    window.open(link.href, "_blank");
                });

                const itemConditionSpan = document.createElement("span");
                itemConditionSpan.id = "itemConditionSpan";
                const itemCondition = document.createElement("p");
                itemCondition.id = "itemCondition";
                itemCondition.textContent = "Condition: " + data.item_conditions[i];
            
                const itemRatedImg = document.createElement("img");
                itemRatedImg.src = "./images/topRatedImage.png";
                itemRatedImg.id = "itemRatedImg";
                if(data.top_rated_images[i] == "false"){
                    itemRatedImg.style.display = "none";
                }

                const itemPrice = document.createElement("p");
                const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.item_prices[i]);
                itemPrice.textContent = "Price: " + formattedPrice;

                //itemPrice.textContent = "Price: $" + data.item_prices[i];
                itemPrice.id = "itemPrice";

                // Add elements to the container
                img_div.appendChild(itemImg);
                itemDescript.appendChild(itemName);
                itemDescript.appendChild(itemCategorySpan);
                itemCategorySpan.appendChild(itemCategory);
                itemCategorySpan.appendChild(itemCategoryImg);
                itemDescript.appendChild(itemConditionSpan);
                itemConditionSpan.appendChild(itemCondition);
                itemConditionSpan.appendChild(itemRatedImg);
                itemDescript.appendChild(itemPrice);

                itemDiv.appendChild(img_div);
                itemDiv.appendChild(itemDescript);

                item_container.appendChild(itemDiv);
            }
            
            container.appendChild(item_container);
            container.appendChild(more_button);
            more_button.style.display = 'block';
        }  

    })
    .catch((error) => {
        // Handle any errors here
        console.error('Error:', error);
    });


}

function fetchItemDetails(itemId) {
    const url = new URL("/single_item", baseUrl);  
    url.searchParams.append("itemId", itemId);

    fetch(url)
    .then(response => response.json())
    .then(item_data => {
        //console.log("data:",item_data);

        const photo = item_data.Item.PictureURL[0];
        const eBayLink = item_data.Item.ViewItemURLForNaturalSearch;
        const title = item_data.Item.Title;
        const price = item_data.Item.CurrentPrice.Value; 
        const location = `${item_data.Item.Location}, ${item_data.Item.PostalCode}`;
        const seller = item_data.Item.Seller.UserID;
        const returnPolicyUS = item_data.Item.ReturnPolicy;

        const itemSpecificsNames = item_data.Item.ItemSpecifics.NameValueList.map(item => item.Name);
        const itemSpecificsValue = item_data.Item.ItemSpecifics.NameValueList.map(item => item.Value);


        let itemSpecificsRows = "";
        for (let i = 0; i < itemSpecificsNames.length; i++) {
            itemSpecificsRows += `
                <tr>
                    <th>${itemSpecificsNames[i]}</th>
                    <td>${itemSpecificsValue[i]}</td>
                </tr>
            `;
        }

        const tableHTML = `
        <p id="item_details_title">Item Details</p>
        <button id="backToResultsBtn" onclick="showContainer()">Back to search results</button>
        <table id="item_details_table">
            <tr>
            <th>Photo</th>
            <td><img src="${photo}" alt="Item photo" width="100"></td>
            </tr>
            <tr>
            <th>eBay Link</th>
            <td><a href="${eBayLink}" target="_blank">eBay Product Link</a></td>
            </tr>
            <tr>
            <th>Title</th>
            <td>${title}</td>
            </tr>
            <tr>
            <th>Price</th>
            <td>${price}</td>
            </tr>
            <tr>
            <th>Location</th>
            <td>${location}</td>
            </tr>
            <tr>
            <th>Seller</th>
            <td>${seller}</td>
            </tr>
            <tr>
            <th>Return Policy (US)</th>
            <td>${returnPolicyUS.ReturnsAccepted}, ${returnPolicyUS.ReturnsWithin}, Refund: ${returnPolicyUS.Refund}, Shipping Cost Paid By: ${returnPolicyUS.ShippingCostPaidBy}</td>
            </tr>
            ${itemSpecificsRows}
        </table>
        `;
        
        document.querySelector("#singleItem_container").innerHTML = tableHTML; 
        const singleItem_container = document.getElementById("singleItem_container");
        singleItem_container.style.display = 'block';



    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function showContainer() {
    container.style.display = 'block';
    const singleItem_container = document.getElementById("singleItem_container");
    singleItem_container.style.display = 'none';
}


function clearData(){
    if(container!=undefined){
        container.innerHTML = "";
    }
    
    queryParams = {};
    const form = document.getElementById("myForm"); 
    form.reset();
}

more_button.addEventListener("click", function() {
    var end = Math.min(data_set.total_results_found, initial_show + 7); 
    for (let i = initial_show; i < end; i++) {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("item", "item_more");

        const img_div = document.createElement("div");
        img_div.classList.add("img_div");

        const itemImg = document.createElement("img");
        if(data_set.image_urls[i]){
            itemImg.src = data_set.image_urls[i];
        }else{
            itemImg.src = "./images/ebay_default.jpg";
        }
        itemImg.id = "itemImg";


        const itemDescript = document.createElement("div");
        itemDescript.classList.add("item_description");

        const itemName = document.createElement("h3");
        itemName.textContent = data_set.itemName[i];

        const itemId = data_set.itemId[i];
        console.log("itemId: ", itemId);

        itemDiv.addEventListener('click', function() {
            container.style.display = 'none';
            fetchItemDetails(itemId);  
        });

        const itemCategorySpan = document.createElement("span");
        itemCategorySpan.id = "itemCategorySpan";

        const itemCategory = document.createElement("p");
        itemCategory.textContent = "Category: " + data_set.item_categories[i];
        itemCategory.id = "itemCategory";
        

        var categories_id = data_set.item_categories_id[i];
        const link = document.createElement("a");
        var s= data_set.item_categories[i].replace(/ & /g, '-')
        s = s.replace(/&/g, '-').replace(/ /g, '-');
        link.href = "https://www.ebay.com/b/" + s + "/" + categories_id;
        console.log("link.href: ", link.href);

        const itemCategoryImg = document.createElement("img");
        itemCategoryImg.src = "./images/redirect.png";
        itemCategoryImg.id = "itemCategoryImg";
        link.appendChild(itemCategoryImg);

        itemCategoryImg.addEventListener("click", function(event) {
            event.stopPropagation();
            window.open(link.href, "_blank");
        });

        const itemConditionSpan = document.createElement("span");
        itemConditionSpan.id = "itemConditionSpan";
        const itemCondition = document.createElement("p");
        itemCondition.id = "itemCondition";
        itemCondition.textContent = "Condition: " + data_set.item_conditions[i];
    
        const itemRatedImg = document.createElement("img");
        itemRatedImg.src = "./images/topRatedImage.png";
        itemRatedImg.id = "itemRatedImg";
        if(data_set.top_rated_images[i] == "false"){
            itemRatedImg.style.display = "none";
        }

        const itemPrice = document.createElement("p");
        const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data_set.item_prices[i]);
        itemPrice.textContent = "Price: " + formattedPrice;
        itemPrice.id = "itemPrice";

        // Add elements to the container
        img_div.appendChild(itemImg);
        itemDescript.appendChild(itemName);
        itemDescript.appendChild(itemCategorySpan);
        itemCategorySpan.appendChild(itemCategory);
        itemCategorySpan.appendChild(itemCategoryImg);
        itemDescript.appendChild(itemConditionSpan);
        itemConditionSpan.appendChild(itemCondition);
        itemConditionSpan.appendChild(itemRatedImg);
        itemDescript.appendChild(itemPrice);

        itemDiv.appendChild(img_div);
        itemDiv.appendChild(itemDescript);

        item_container.appendChild(itemDiv);
    }
    //container.appendChild(item_container);
    container.appendChild(less_button);
    less_button.style.display = 'block';
    more_button.style.display = 'none';
    window.scrollTo(0, document.body.scrollHeight); // Scroll to the bottom
});

less_button.addEventListener("click", function() {
    const itemsToRemove = document.querySelectorAll('.item_more');
    itemsToRemove.forEach(itemToRemove => {
        itemToRemove.remove();
    });
    less_button.style.display = 'none';
    more_button.style.display = 'block';
    window.scrollTo(0, 0); // Scroll to the top
});

//“How to let less_button remove item_more after click” prompt (7 line). ChatGPT, 15 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.



document.addEventListener("DOMContentLoaded", function() {
    
    document.getElementById("ebayLogo").addEventListener("click", function() {
        window.open("https://www.ebay.com", "_blank");
    });

    document.getElementById("myForm").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevents the form from submitting the traditional way.
    
        const formData = new FormData(event.target);
    
        // Extracting singular values
        keywords = formData.get('keywords');
        let price_min = formData.get('price_min');
        let price_max = formData.get('price_max');
        let sort = formData.get('sort');
    
        // Extracting values from multiple checkboxes with the same name
        let conditions = formData.getAll('condition');
        let sellers = formData.get('seller');
        let shippings_free = formData.get('shipping_free');
        let shippings_expedited = formData.get('shipping_expedited');
        console.log("conditions:", conditions);
        // Creating the queryParams object
        let timestamp = new Date().getTime();

        //console.log("price_min: ",price_min);

        queryParams = {
            'keywords': keywords,
            'paginationInput.entriesPerPage': '10',
            'sortOrder': sort,
            'itemFilter(0).name': 'MaxPrice',
            'itemFilter(0).value': price_max,
            'itemFilter(1).name': 'MinPrice',
            'itemFilter(1).value': price_min,
            'itemFilter(2).name': 'Condition',
            'itemFilter(3).name':'ReturnsAcceptedOnly',
            'itemFilter(3).value': sellers,
            'itemFilter(4).name':'FreeShippingOnly',
            'itemFilter(4).value': shippings_free,
            'itemFilter(5).name':'ExpeditedShippingType',
            'itemFilter(5).value': shippings_expedited,
            '_': timestamp,
        };

        
        for (let i = 0; i < conditions.length; i++) {
            const key = `itemFilter(2).value(${i})`;
            queryParams[key] = conditions[i];
        }

        // Logging
        console.log("queryParams:", queryParams);
        
        price_min = (price_min !== "") ? parseInt(price_min) : "";
        price_max = (price_max !== "") ? parseInt(price_max) : "";

        if(price_min!="" && price_max!=""){
            if(price_min > price_max){
                alert("Opps! Lower price cannot be greater than upper price limit! Please try again");
                return;
            }
    
            if(price_max<= 0 || price_min<=0){
                alert("Price Range values cannot be negative! Please try a value greater than or equal to 0.0");
                return;
            }
        }else if(price_min=="" && price_max!=""){
            if(price_max<= 0){
                alert("Price Range values cannot be negative! Please try a value greater than or equal to 0.0");
                return;
            }
        }else if(price_max=="" && price_min!=""){
            if(price_min<= 0){
                alert("Price Range values cannot be negative! Please try a value greater than or equal to 0.0");
                return;
            }
        }

        search();
    });
    
});

//“How to stay in same page when form is submit” prompt (1 line). ChatGPT, 15 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.