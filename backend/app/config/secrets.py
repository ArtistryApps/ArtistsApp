from google.cloud import secretmanager 

PROJECT_ID = "musicwebsite-425022"
# Requires GOOGLE_APPLICATION_CREDENTIALS env var set to the service account JSON path
client = secretmanager.SecretManagerServiceClient()

def get_secret(secret_id: str, version: str = "latest") -> str:
    name = f"projects/{PROJECT_ID}/secrets/{secret_id}/versions/{version}"
    response = client.access_secret_version(request={"name": name})
    return response.payload.data.decode("utf-8")