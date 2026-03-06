let newsData = []

fetch("data/news.json")
.then(res => res.json())
.then(data => {
newsData = data
renderNews(data)
})

function renderNews(data){

const container = document.getElementById("news-container")
container.innerHTML = ""

data.forEach(news => {

const card = document.createElement("div")
card.className = "card"

card.innerHTML = `
<h3>${news.title}</h3>
<p class="category">${news.category}</p>
<p>${news.content.substring(0,60)}...</p>
`

card.onclick = () => {
localStorage.setItem("selectedNews", JSON.stringify(news))
window.location.href = "pages/detail.html"
}

container.appendChild(card)

})

}

document.getElementById("search").addEventListener("input", function(){

const text = this.value.toLowerCase()

const filtered = newsData.filter(n =>
n.title.toLowerCase().includes(text)
)

renderNews(filtered)

})

document.getElementById("category").addEventListener("change", function(){

const cat = this.value

if(cat == "all"){
renderNews(newsData)
return
}

const filtered = newsData.filter(n =>
n.category == cat
)

renderNews(filtered)

})
