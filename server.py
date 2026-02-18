import http.server
import socketserver
import json
import os
from urllib.parse import urlparse, parse_qs

PORT = 5000

DATA = {
    "communityCategories": [
        {
            "id": 1,
            "name": "运动健身",
            "icon": "🏃",
            "posts": [
                {
                    "id": 1,
                    "userId": 101,
                    "username": "运动达人阿杰",
                    "time": "2小时前",
                    "text": "今天夜跑打卡10公里！感觉整个人都清爽了～有没有喜欢夜跑的小伙伴可以约一下，互相监督坚持运动！",
                    "image": "https://picsum.photos/400/280?random=1",
                    "likes": 256,
                    "comments": 67,
                    "shares": 15
                },
                {
                    "id": 2,
                    "userId": 1,
                    "username": "篮球小王子",
                    "time": "5小时前",
                    "text": "明天下午3点篮球场有人打球吗？缺人组队！技术菜但积极！",
                    "image": "https://picsum.photos/400/280?random=2",
                    "likes": 89,
                    "comments": 23,
                    "shares": 4
                }
            ]
        },
        {
            "id": 2,
            "name": "学习交流",
            "icon": "📚",
            "posts": [
                {
                    "id": 3,
                    "userId": 102,
                    "username": "小林同学",
                    "time": "1小时前",
                    "text": "今天的图书馆氛围真的很棒！阳光透过窗户洒进来，让人很有学习的动力～有没有一起准备期末考的搭子？",
                    "image": "https://picsum.photos/400/280?random=3",
                    "likes": 128,
                    "comments": 42,
                    "shares": 8
                },
                {
                    "id": 4,
                    "userId": 5,
                    "username": "代码大神",
                    "time": "6小时前",
                    "text": "最近在学Python，有一起的吗？建了个学习群，大家可以一起讨论问题",
                    "image": "https://picsum.photos/400/280?random=4",
                    "likes": 156,
                    "comments": 58,
                    "shares": 12
                }
            ]
        },
        {
            "id": 3,
            "name": "美食探店",
            "icon": "🍜",
            "posts": [
                {
                    "id": 5,
                    "userId": 103,
                    "username": "探店小能手",
                    "time": "3小时前",
                    "text": "发现学校附近新开了一家超棒的咖啡店！环境超适合拍照，而且拿铁拉花超级好看～周末有没有一起去打卡的？",
                    "image": "https://picsum.photos/400/280?random=5",
                    "likes": 189,
                    "comments": 54,
                    "shares": 21
                },
                {
                    "id": 6,
                    "userId": 9,
                    "username": "美食家小王",
                    "time": "7小时前",
                    "text": "食堂三楼新开的窗口真的绝了！推荐大家去尝尝～",
                    "image": "https://picsum.photos/400/280?random=6",
                    "likes": 203,
                    "comments": 76,
                    "shares": 18
                }
            ]
        },
        {
            "id": 4,
            "name": "休闲娱乐",
            "icon": "🎮",
            "posts": [
                {
                    "id": 7,
                    "userId": 104,
                    "username": "游戏爱好者",
                    "time": "4小时前",
                    "text": "周末有人一起开黑吗？王者荣耀/原神都可以！",
                    "image": "https://picsum.photos/400/280?random=7",
                    "likes": 145,
                    "comments": 38,
                    "shares": 9
                },
                {
                    "id": 8,
                    "userId": 105,
                    "username": "电影迷",
                    "time": "8小时前",
                    "text": "最近有什么好看的电影推荐吗？想找个人一起去看",
                    "image": "https://picsum.photos/400/280?random=8",
                    "likes": 98,
                    "comments": 45,
                    "shares": 6
                }
            ]
        }
    ],
    "matchUsers": [
        {"id": 1, "name": "篮球小王子", "tags": ["篮球", "健身", "跑步"], "gender": "男", "grade": "大二", "bio": "热爱运动，希望找到一起打球的伙伴"},
        {"id": 2, "name": "瑜伽小仙女", "tags": ["瑜伽", "冥想", "普拉提"], "gender": "女", "grade": "大三", "bio": "喜欢瑜伽和冥想，追求内心的平静"},
        {"id": 3, "name": "游泳健将", "tags": ["游泳", "潜水", "冲浪"], "gender": "男", "grade": "大一", "bio": "从小喜欢水，各种水上运动都爱"},
        {"id": 4, "name": "骑行爱好者", "tags": ["骑行", "户外", "露营"], "gender": "男", "grade": "大四", "bio": "喜欢骑行看风景，周末经常去露营"},
        {"id": 5, "name": "代码大神", "tags": ["编程", "算法", "AI"], "gender": "男", "grade": "大三", "bio": "计算机专业，喜欢研究新技术"},
        {"id": 6, "name": "外语达人", "tags": ["英语", "日语", "韩语"], "gender": "女", "grade": "大二", "bio": "外语系学生，正在学习多国语言"},
        {"id": 7, "name": "考研党", "tags": ["考研", "高数", "政治"], "gender": "女", "grade": "大四", "bio": "正在准备考研，希望找到一起学习的伙伴"},
        {"id": 8, "name": "设计爱好者", "tags": ["UI", "插画", "摄影"], "gender": "女", "grade": "大二", "bio": "视觉传达专业，喜欢画画和摄影"},
        {"id": 9, "name": "美食家小王", "tags": ["火锅", "烧烤", "日料"], "gender": "男", "grade": "大三", "bio": "人生目标是吃遍天下美食"},
        {"id": 10, "name": "甜点控", "tags": ["蛋糕", "奶茶", "咖啡"], "gender": "女", "grade": "大一", "bio": "没有什么是一个蛋糕解决不了的，如果有就两个"},
        {"id": 11, "name": "厨艺达人", "tags": ["烘焙", "家常菜", "西餐"], "gender": "男", "grade": "大四", "bio": "喜欢自己做饭，健康又美味"},
        {"id": 12, "name": "素食主义", "tags": ["素食", "轻食", "健康餐"], "gender": "女", "grade": "大二", "bio": "坚持素食三年，身体健康最重要"}
    ],
    "searchSuggestions": ["篮球", "跑步", "瑜伽", "考研", "编程", "摄影", "火锅", "咖啡", "骑行", "游泳"],
    "chats": [
        {
            "id": 1,
            "name": "小林同学",
            "lastMessage": "好的，那明天图书馆见！",
            "time": "10:30",
            "unread": 2,
            "messages": [
                {"sent": False, "text": "嗨，你也在准备期末考吗？"},
                {"sent": True, "text": "对呀！正愁没人一起复习呢"},
                {"sent": False, "text": "太好了！我也是，明天一起去图书馆吧？"},
                {"sent": True, "text": "没问题！几点方便？"},
                {"sent": False, "text": "早上9点怎么样？"},
                {"sent": True, "text": "可以的"},
                {"sent": False, "text": "好的，那明天图书馆见！"}
            ]
        }
    ]
}

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def _send_json_response(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/community':
            self._send_json_response({"categories": DATA["communityCategories"]})
        elif parsed_path.path == '/api/match/users':
            self._send_json_response({"users": DATA["matchUsers"]})
        elif parsed_path.path == '/api/match/suggestions':
            self._send_json_response({"suggestions": DATA["searchSuggestions"]})
        elif parsed_path.path.startswith('/api/match/search'):
            query = parse_qs(parsed_path.query).get('q', [''])[0].lower()
            if query:
                filtered = [u for u in DATA["matchUsers"] if any(query in tag.lower() for tag in u["tags"]) or query in u["name"].lower()]
                self._send_json_response({"users": filtered})
            else:
                self._send_json_response({"users": DATA["matchUsers"]})
        elif parsed_path.path == '/api/chats':
            self._send_json_response({"chats": DATA["chats"]})
        elif parsed_path.path.startswith('/api/chats/'):
            chat_id = int(parsed_path.path.split('/')[-1])
            chat = next((c for c in DATA["chats"] if c["id"] == chat_id), None)
            if chat:
                self._send_json_response(chat)
            else:
                self._send_json_response({"error": "Chat not found"}, 404)
        else:
            super().do_GET()
    
    def do_POST(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path.startswith('/api/chats/') and parsed_path.path.endswith('/messages'):
            chat_id = int(parsed_path.path.split('/')[-2])
            chat = next((c for c in DATA["chats"] if c["id"] == chat_id), None)
            
            if chat:
                content_length = int(self.headers['Content-Length'])
                post_data = json.loads(self.rfile.read(content_length))
                
                chat["messages"].append({
                    "sent": post_data.get("sent", True),
                    "text": post_data.get("text", "")
                })
                chat["lastMessage"] = post_data.get("text", "")
                chat["time"] = "刚刚"
                
                self._send_json_response({"success": True, "chat": chat})
            else:
                self._send_json_response({"error": "Chat not found"}, 404)
        else:
            self._send_json_response({"error": "Not found"}, 404)

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        print(f"API endpoints:")
        print(f"  GET /api/community - 获取社区分类和帖子")
        print(f"  GET /api/match/users - 获取所有搭子用户")
        print(f"  GET /api/match/suggestions - 获取搜索建议")
        print(f"  GET /api/match/search?q=关键词 - 搜索搭子")
        print(f"  GET /api/chats - 获取聊天列表")
        print(f"  GET /api/chats/<id> - 获取单个聊天详情")
        print(f"  POST /api/chats/<id>/messages - 发送消息")
        httpd.serve_forever()
