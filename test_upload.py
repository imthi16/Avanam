import requests

with open("test.txt", "w") as f:
    f.write("test content")

with open("test.txt", "rb") as f:
    response = requests.post("http://localhost:8000/api/documents/upload", files={"file": f})
    
print(response.status_code)
print(response.text)
