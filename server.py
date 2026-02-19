from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

# 数据库文件路径
DATABASE_PATH = 'database.json'

# 读取数据库文件
def read_database():
    """ 读取数据库文件并返回数据 """
    if os.path.exists(DATABASE_PATH):
        with open(DATABASE_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"friends": []}

# 获取所有好友信息
@app.route('/api/friends', methods=['GET'])
def get_friends():
    """ 获取所有好友信息接口 """
    data = read_database()
    return jsonify(data)

# 搜索好友
@app.route('/api/search', methods=['GET'])
def search_friends():
    """ 根据昵称搜索好友接口 """
    keyword = request.args.get('keyword', '').lower()
    data = read_database()
    friends = data.get('friends', [])
    
    if keyword:
        # 筛选昵称匹配的好友
        filtered_friends = [
            friend for friend in friends 
            if keyword in friend['nickname'].lower()
        ]
        return jsonify({"friends": filtered_friends})
    
    return jsonify(data)

# 获取指定好友的聊天记录
@app.route('/api/friend/<int:friend_id>', methods=['GET'])
def get_friend_detail(friend_id):
    """ 获取指定好友的详细信息和聊天记录接口 """
    data = read_database()
    friends = data.get('friends', [])
    
    for friend in friends:
        if friend['id'] == friend_id:
            return jsonify(friend)
    
    return jsonify({"error": "好友不存在"}), 404

if __name__ == '__main__':
    print("后端服务器启动中...")
    print("访问地址: http://localhost:5000")
    app.run(debug=True, port=5000)