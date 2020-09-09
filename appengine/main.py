from flask import Flask, request, abort, jsonify, abort
from werkzeug.exceptions import HTTPException
from google.cloud import firestore
from collections import defaultdict

client = firestore.Client()

valid_collections = (
    'data-awards'
)

app = Flask(__name__)

def argmin(x):
    return min(range(len(x)), key=lambda e: x[e])

def argmax(x):
    return max(range(len(x)), key=lambda e: x[e])

@app.errorhandler(Exception)
def handle_error(e):
    if isinstance(e, HTTPException):
        return e.description, e.code
    else:
        return str(e), 500

@app.route('/summary/data-awards')
def summary_data_awards():
    output = ''
    totals = defaultdict(list)
    for doc in client.collection('data-awards').get():
        data = doc.to_dict() 
        computer_id = data['id']
        for backend, categories in data['totals'].items():
            for name, count in categories.items():
                category = backend + '.' + name
                totals[category].append((count, computer_id))
    grand_totals = defaultdict(int)
    for category in totals:
        for count, coumputer_id in totals[category]:
            grand_totals[computer_id] += count
        output += category + '\n'
        counts, computer_ids = zip(*totals[category])
        min_i = argmin(counts)
        max_i = argmax(counts)
        output += f' min {computer_ids[min_i]} {counts[min_i]}\n'
        output += f' max {computer_ids[min_i]} {counts[max_i]}\n'
    output += 'grand totals\n'
    computer_ids, counts = zip(*grand_totals.items())
    min_i = argmin(counts)
    max_i = argmax(counts)
    output += f' min {computer_ids[min_i]} {counts[min_i]}\n'
    output += f' max {computer_ids[min_i]} {counts[max_i]}\n'
    return output

@app.route('/submit/<collection>', methods=['POST'])
def submit(collection):
    if collection not in valid_collections:
        abort(500, 'Invalid collection')
    try:
        data = request.json
        computer_id = data['id']
        client.collection(collection).document(computer_id).set(data)
    except Exception as e:
        print(e)
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)