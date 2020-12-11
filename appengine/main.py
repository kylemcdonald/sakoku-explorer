from flask import Flask, request, abort, jsonify, abort
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from google.cloud import firestore
from collections import defaultdict, Counter
import random
import os

client = firestore.Client()

valid_collections = (
    'data-awards',
    'same-websites',
    'same-videos',
    'same-searches'
)

app = Flask(__name__)
CORS(app)

@app.errorhandler(Exception)
def handle_error(e):
    if isinstance(e, HTTPException):
        return e.description, e.code
    else:
        return str(e), 500

def get_same(collection_name, field_name, group):
    if 'key' not in request.args or request.args.get('key') != os.environ['ADMIN_PASSWORD']:
        abort(403, 'Access denied')
    group = int(group)
    max_results = 10
    min_common = 1
    if 'max_results' in request.args:
        max_results = int(request.args.get('max_results'))
    if 'min_common' in request.args:
        min_common = int(request.args.get('min_common'))
    results = []
    for doc in client.collection(collection_name).where("group", "==", group).stream():
        data = doc.to_dict()
        results.extend(data[field_name])
    output = ''
    random.shuffle(results)
    for site, count in Counter(results).most_common(max_results):
        if count >= min_common:
            output += f'{count} {site}\n'
    return output

@app.route('/summary/same-websites/<group>')
def summary_same_websites(group):
    return get_same('same-websites', 'websites', group)

@app.route('/summary/same-videos/<group>')
def summary_same_videos(group):
    return get_same('same-videos', 'videos', group)

@app.route('/summary/same-searches/<group>')
def summary_same_searches(group):
    return get_same('same-searches', 'searches', group)

@app.route('/submit/<collection>', methods=['POST'])
def submit(collection):
    response = {}
    if collection not in valid_collections:
        abort(500, 'Invalid collection')
    try:
        data = request.json
        computer_id = data['id']
        client.collection(collection).document(computer_id).set(data)
        response['status'] = 'success'
    except Exception as e:
        response['status'] = 'error'
        response['message'] = str(e)
    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)