import requests
import base64

class OAuthToken:
    def __init__(self, client_id, client_secret):
        self.client_id = client_id
        self.client_secret = client_secret

    def getBase64Encoding(self):
        sample_string = f"{self.client_id}:{self.client_secret}"
        sample_string_bytes = sample_string.encode("ascii")

        base64_bytes = base64.b64encode(sample_string_bytes)
        base64_string = base64_bytes.decode("ascii")

        return base64_string

    def getApplicationToken(self):
        url = "https://api.ebay.com/identity/v1/oauth2/token"

        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Basic {self.getBase64Encoding()}",
        }

        data = {
            "grant_type": "client_credentials",
            "scope": "https://api.ebay.com/oauth/api_scope"
        }

        response = requests.post(url, headers=headers, data=data)
        return response.json()["access_token"]
