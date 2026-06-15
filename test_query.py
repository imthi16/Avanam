import requests

response = requests.post("http://localhost:8000/api/query", json={"query": "Give me a Week 1 question"}, stream=True)

print("Status Code:", response.status_code)
for line in response.iter_lines():
    if line:
        print(line.decode("utf-8"))
