from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/api/IsWorking", methods=["POST"])
def handler(event, context):
    import json
    # Vercel sends event with method, body etc.
    if event['httpMethod'] != 'POST':
        return {
            "statusCode": 405,
            "body": json.dumps({"error": "Method not allowed"})
        }

    # Your logic here
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"message": "POST works!"})
    }
