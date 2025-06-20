from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/api/IsWorking", methods=["POST"])
def test_post():
    return jsonify({"message": "POST works!"})