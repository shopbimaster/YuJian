const API_BASE = 'http://localhost:5000/api';

let appData = {
    communityCategories: [],
    matchUsers: [],
    searchSuggestions: [],
    chats: []
};

let currentCategory = null;
let currentChat = null;

async function fetchData() {
    try {
        const [communityRes, usersRes, suggestionsRes, chatsRes] = await Promise.all([
            fetch(`${API_BASE}/community`),
            fetch(`${API_BASE}/match/users`),
            fetch(`${API_BASE}/match/suggestions`),
            fetch(`${API_BASE}/chats`)
        ]);
        
        const communityData = await communityRes.json();
        const usersData = await usersRes.json();
        const suggestionsData = await suggestionsRes.json();
        const chatsData = await chatsRes.json();
        
        appData.communityCategories = communityData.categories;
        appData.matchUsers = usersData.users;
        appData.searchSuggestions = suggestionsData.suggestions;
        appData.chats = chatsData.chats;
        
        renderCommunityCategories();
        renderSuggestions();
        renderSearchResults(appData.matchUsers);
        renderChats();
    } catch (error) {
        console.error('Error fetching data:', error);
        renderCommunityCategories(getDefaultCategories());
        renderSuggestions(getDefaultSuggestions());
        renderSearchResults(getDefaultUsers());
        renderChats();
    }
}

function renderCommunityCategories(categories = null) {
    const cats = categories || appData.communityCategories || getDefaultCategories();
    const container = document.getElementById('community-categories');
    container.innerHTML = cats.map(cat => `
        <div class="category-card" data-category-id="${cat.id}">
            <div class="category-card-header">
                <div class="category-card-icon">${cat.icon}</div>
                <div class="category-card-name">${cat.name}</div>
                <div class="category-card-arrow">›</div>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const categoryId = parseInt(card.getAttribute('data-category-id'));
            openCategoryDetail(categoryId);
        });
    });
}

function openCategoryDetail(categoryId) {
    const cats = appData.communityCategories.length > 0 ? appData.communityCategories : getDefaultCategories();
    const category = cats.find(c => c.id === categoryId);
    if (!category) return;
    
    currentCategory = category;
    document.getElementById('category-detail-title').textContent = category.icon + ' ' + category.name;
    renderCategoryPosts(category.posts);
    document.getElementById('category-detail').classList.add('active');
}

function renderCategoryPosts(posts) {
    const container = document.getElementById('category-detail-content');
    container.innerHTML = posts.map(post => `
        <div class="post-card">
            <div class="post-header">
                <div class="post-avatar">${post.username.charAt(0)}</div>
                <div class="post-user-info">
                    <div class="post-username">${post.username}</div>
                    <div class="post-time">${post.time}</div>
                </div>
            </div>
            <div class="post-content">
                <div class="post-text">${post.text}</div>
                <img class="post-image" src="${post.image}" alt="">
            </div>
            <div class="post-stats">
                <div class="stat-item">
                    <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    <span>${post.likes}</span>
                </div>
                <div class="stat-item">
                    <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span>${post.comments}</span>
                </div>
                <div class="stat-item">
                    <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    <span>${post.shares}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderSuggestions(suggestions = null) {
    const suggs = suggestions || appData.searchSuggestions || getDefaultSuggestions();
    const container = document.getElementById('suggestions-list');
    container.innerHTML = suggs.map(s => `
        <div class="suggestion-item" data-suggestion="${s}">
            <div class="suggestion-tag">${s}</div>
        </div>
    `).join('');
    
    container.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            const s = item.getAttribute('data-suggestion');
            document.getElementById('match-search-input').value = s;
            document.getElementById('search-suggestions').classList.remove('active');
            performSearch(s);
        });
    });
}

function renderSearchResults(users) {
    const container = document.getElementById('search-results');
    container.innerHTML = `
        <div class="search-results-title">为你推荐 ${users.length} 位搭子</div>
        ${users.map(user => `
            <div class="match-user-card">
                <div class="match-user-avatar">${user.name.charAt(0)}</div>
                <div class="match-user-info">
                    <div class="match-user-name">${user.name}</div>
                    <div class="match-user-meta">${user.gender || '保密'} · ${user.grade || '未知年级'}</div>
                    <div class="match-user-tags">
                        ${user.tags.map(tag => `<div class="match-user-tag">${tag}</div>`).join('')}
                    </div>
                </div>
            </div>
        `).join('')}
    `;
}

async function performSearch(query) {
    try {
        const res = await fetch(`${API_BASE}/match/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        renderSearchResults(data.users);
    } catch (error) {
        const users = getDefaultUsers();
        const filtered = query ? 
            users.filter(u => u.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) || u.name.toLowerCase().includes(query.toLowerCase())) :
            users;
        renderSearchResults(filtered.length > 0 ? filtered : users);
    }
}

function renderChats() {
    const chats = appData.chats.length > 0 ? appData.chats : getDefaultChats();
    const list = document.getElementById('chat-list');
    list.innerHTML = chats.map(chat => `
        <div class="chat-item" data-chat-id="${chat.id}">
            <div class="chat-avatar">${chat.name.charAt(0)}</div>
            <div class="chat-content">
                <div class="chat-header-row">
                    <div class="chat-name">${chat.name}</div>
                    <div class="chat-time">${chat.time}</div>
                </div>
                <div class="chat-preview">${chat.lastMessage}</div>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', () => {
            const chatId = parseInt(item.getAttribute('data-chat-id'));
            openChat(chatId);
        });
    });
}

async function openChat(chatId) {
    try {
        const res = await fetch(`${API_BASE}/chats/${chatId}`);
        currentChat = await res.json();
    } catch (error) {
        const chats = appData.chats.length > 0 ? appData.chats : getDefaultChats();
        currentChat = chats.find(c => c.id === chatId);
    }
    
    if (!currentChat) return;
    
    document.getElementById('chat-detail-title').textContent = currentChat.name;
    renderMessages();
    document.getElementById('chat-detail').classList.add('active');
}

function renderMessages() {
    if (!currentChat) return;
    
    const container = document.getElementById('chat-messages');
    container.innerHTML = currentChat.messages.map(msg => `
        <div class="message-bubble ${msg.sent ? 'sent' : 'received'}">
            <div class="message-content">${msg.text}</div>
        </div>
    `).join('');
    
    container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || !currentChat) return;
    
    currentChat.messages.push({ sent: true, text: text });
    input.value = '';
    renderMessages();
    
    try {
        await fetch(`${API_BASE}/chats/${currentChat.id}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sent: true, text: text })
        });
    } catch (error) {
        console.error('Error sending message:', error);
    }
    
    setTimeout(() => {
        const replies = ['好的～', '收到！', '没问题', '哈哈', '👍', '可以的'];
        currentChat.messages.push({ 
            sent: false, 
            text: replies[Math.floor(Math.random() * replies.length)] 
        });
        renderMessages();
    }, 1000);
}

function getDefaultCategories() {
    return [
        { id: 1, name: '运动健身', icon: '🏃', posts: [
            { id: 1, userId: 101, username: '运动达人阿杰', time: '2小时前', text: '今天夜跑打卡10公里！', image: 'https://picsum.photos/400/280?random=1', likes: 256, comments: 67, shares: 15 },
            { id: 2, userId: 1, username: '篮球小王子', time: '5小时前', text: '明天下午3点篮球场有人打球吗？', image: 'https://picsum.photos/400/280?random=2', likes: 89, comments: 23, shares: 4 }
        ]},
        { id: 2, name: '学习交流', icon: '📚', posts: [
            { id: 3, userId: 102, username: '小林同学', time: '1小时前', text: '今天的图书馆氛围真的很棒！', image: 'https://picsum.photos/400/280?random=3', likes: 128, comments: 42, shares: 8 }
        ]},
        { id: 3, name: '美食探店', icon: '🍜', posts: [
            { id: 5, userId: 103, username: '探店小能手', time: '3小时前', text: '发现学校附近新开了一家超棒的咖啡店！', image: 'https://picsum.photos/400/280?random=5', likes: 189, comments: 54, shares: 21 }
        ]},
        { id: 4, name: '休闲娱乐', icon: '🎮', posts: [] }
    ];
}

function getDefaultUsers() {
    return [
        { id: 1, name: '篮球小王子', tags: ['篮球', '健身', '跑步'], gender: '男', grade: '大二', bio: '热爱运动，希望找到一起打球的伙伴' },
        { id: 2, name: '瑜伽小仙女', tags: ['瑜伽', '冥想', '普拉提'], gender: '女', grade: '大三', bio: '喜欢瑜伽和冥想，追求内心的平静' },
        { id: 3, name: '游泳健将', tags: ['游泳', '潜水', '冲浪'], gender: '男', grade: '大一', bio: '从小喜欢水，各种水上运动都爱' },
        { id: 4, name: '骑行爱好者', tags: ['骑行', '户外', '露营'], gender: '男', grade: '大四', bio: '喜欢骑行看风景，周末经常去露营' },
        { id: 5, name: '代码大神', tags: ['编程', '算法', 'AI'], gender: '男', grade: '大三', bio: '计算机专业，喜欢研究新技术' },
        { id: 6, name: '外语达人', tags: ['英语', '日语', '韩语'], gender: '女', grade: '大二', bio: '外语系学生，正在学习多国语言' }
    ];
}

function getDefaultSuggestions() {
    return ['篮球', '跑步', '瑜伽', '考研', '编程', '摄影', '火锅', '咖啡', '骑行', '游泳'];
}

function getDefaultChats() {
    return [
        { id: 1, name: '小林同学', lastMessage: '好的，那明天图书馆见！', time: '10:30', messages: [
            { sent: false, text: '嗨，你也在准备期末考吗？' },
            { sent: true, text: '对呀！正愁没人一起复习呢' },
            { sent: false, text: '太好了！我也是，明天一起去图书馆吧？' }
        ]}
    ];
}

document.addEventListener('DOMContentLoaded', function() {
    fetchData();
    
    const searchInput = document.getElementById('match-search-input');
    const suggestionsDiv = document.getElementById('search-suggestions');
    
    searchInput.addEventListener('focus', () => {
        suggestionsDiv.classList.add('active');
    });
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query) {
            performSearch(query);
        } else {
            renderSearchResults(appData.matchUsers.length > 0 ? appData.matchUsers : getDefaultUsers());
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            suggestionsDiv.classList.remove('active');
        }
    });
    
    document.getElementById('category-back-btn').addEventListener('click', () => {
        document.getElementById('category-detail').classList.remove('active');
    });
    
    const tabItems = document.querySelectorAll('.tab-item');
    const pages = document.querySelectorAll('.page');
    
    tabItems.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-page');
            
            tabItems.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            
            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(targetPage).classList.add('active');
            
            document.getElementById('chat-detail').classList.remove('active');
            document.getElementById('category-detail').classList.remove('active');
        });
    });
    
    document.getElementById('chat-back-btn').addEventListener('click', () => {
        document.getElementById('chat-detail').classList.remove('active');
    });
    
    document.getElementById('chat-send-btn').addEventListener('click', sendMessage);
    
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(e) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
});
