from flask import Flask, request, abort, jsonify
from collections import defaultdict
import json
import time

app = Flask(__name__)

database = defaultdict(set)

# reload from memory
# with open('database-1597192835.1715908.json') as f:
#     state = json.load(f)
# for key, values in state.items():
#     database[key].update(values)

@app.route('/submit', methods=['POST'])
def submit():
    machine_id = request.json['machineId']
    print(machine_id)

    matched = {}
    for hashed_domain in request.json['hashedDomains']:
        database[hashed_domain].update([machine_id])
        if len(database[hashed_domain]) > 1:
            matched[hashed_domain] = len(database[hashed_domain])

    print('common: ' + str(len(matched)))

    return jsonify(matched)

@app.route('/save')
def save():
    # need to save the data to disk right here
    cur_time = time.time()
    with open('database-' + str(cur_time) + '.json', 'w') as f:
        database_lists = {}
        for k,v in database.items():
            database_lists[k] = list(v)
        json.dump(database_lists, f)

    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True)