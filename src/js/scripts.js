
import { hauntedPlaces } from './hauntedPlaces.js'
//import { process } from './env.js'
import OpenAI from 'openai'



const lookUpForm = document.getElementById("look-up")
const selectState = document.getElementById("select-state")
const searchBtn = document.getElementById("search-btn")
const randomBtn = document.getElementById("random-btn")
const aiEnhanced = document.getElementById("ai-elements")
const menuIcon = document.querySelector(".hamburger")
const menu = document.getElementById("menu")
const volumeOn = document.getElementById("volumeOn")
const volumeOff = document.getElementById("volumeOff")
const audio = document.getElementById("audio")

volumeOn.addEventListener("click", function () {    
    volumeOff.style.display = "block"
    audio.pause()
    volumeOn.style.display = "none"  
})

volumeOff.addEventListener("click", function () {    
    volumeOff.style.display = "none"
    audio.play()
    volumeOn.style.display = "block"  
})

const modal = document.getElementById("alertModal")

modal.addEventListener("click", function() {
    modal.style.display= "none"
})

const elements = document.querySelectorAll(".toggle-elements")

//particlesJS.load('particles-js', 'particlesjs-config.json')

function playIntro() {
    const intro = document.getElementById("header-intro")
    if (intro) {
        intro.style.display = "block"
    }
} 

window.onload = playIntro()

function showLookUpForm() {
    lookUpForm.style.display = "flex"
}

setTimeout(showLookUpForm, 12000)

menuIcon.addEventListener("click", function() {
    menuIcon.classList.toggle("is-active")
    if (menu.style.display === "flex") {
        menu.style.display = "none"
      } else {
        menu.style.display = "flex"
      }
})

searchBtn.addEventListener("click", function(e){
    e.preventDefault()  
    if (selectState.value) {        
        showHide(true)
        enhanceStoryStateValue()
        setTimeout(showRefreshBtn, 8000)        
    } else {            
        showHide(false)
        modal.style.display = "block"
    }
})

selectState.addEventListener('change', function () {
    if (selectState.value) {
        searchBtn.classList.add("btnGlow")
        randomBtn.style.opacity = 0.25
    } else {
        searchBtn.classList.remove("btnGlow")
        randomBtn.style.opacity = 1
    }
})

randomBtn.addEventListener("click", function(e){
    e.preventDefault() 
    showHide(true)    
    enhanceStory()
    setTimeout(showRefreshBtn, 8000)    
})

function showHide(shouldRun) {
    if (shouldRun) {
        elements.forEach(element => {
            // Check the current display style
            if (element.style.display === "none" || getComputedStyle(element).display === "none") {
                // If it's currently hidden, show it
                element.style.display = "block"// You can use "inline-block" or other values as needed
            } else {
                // If it's currently visible, hide it
                element.style.display = "none"
            }
            })   
    }
}


const refreshBtn = document.getElementById("refresh-btn")
refreshBtn.addEventListener("click", function(){
    showHide(true)
    aiEnhanced.innerHTML = ""
    selectState.value = ""
    searchBtn.classList.remove("btnGlow")
    randomBtn.style.opacity = 1
    refreshBtn.style.display= "none"
})

function showRefreshBtn() {
    refreshBtn.style.display = "block"
}


//AI Enhanced 

const openai = new OpenAI({    
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
})

async function enhanceStory() {   
    // Map over all data to find any story
    const newHauntedArr = hauntedPlaces.map(dataFromArr => { 
        return`     
        <h2 id="haunted-title">${dataFromArr.location}</h2>
        <div id="rendered-story">
            <p class="story-label">City:</p><p class="story-text">${dataFromArr.city}</p><br>
            <p class="story-label">State:</p><p class="story-text"> ${dataFromArr.state}</p><br>
            <p class="story" id="the-story">${dataFromArr.description}</p>
        </div>        
        `          
    }) 
    
    const bigStoriesFromArr = newHauntedArr.filter((longStoriesOnly) => {
        return longStoriesOnly.length > 400
    }) 

    //Generate a random story
    const randomStory = bigStoriesFromArr[Math.floor(Math.random() * bigStoriesFromArr.length)]

     //*** Target paragraph for AI use ***//
    // Create a temporary element to parse the HTML content
    const tempElement = document.createElement('div')
    tempElement.innerHTML = randomStory

    //Access story div from randomStory
    const storyDiv = tempElement.querySelector("#the-story")
    const storyInput = storyDiv.textContent

    const response = await openai.completions.create({
        model: 'gpt-3.5-turbo-instruct',
        prompt: `Referring to the following statement, fix all grammatical errors and expand on it by a few sentences - making it slightly more spooky but do not drift away from original story. Make sure it has a proper ending. Remove any URLs found within the following or anything that may lead to an external website: ${storyInput}`,
        max_tokens: 3000,
        temperature: 1
    })

    const generatedStory = response.choices[0].text.trim()

    aiEnhanced.innerHTML = `
    <div class="story" id="AI-enhanced-story">     
        ${randomStory}    
        ${generatedStory}         
    </div> 
    `    
}

async function enhanceStoryStateValue() {
    const targetState = selectState.value
    const matchingValues = hauntedPlaces.filter(obj => obj.state === targetState)
     
    // Map over all data to find story with user's selected state
    const sameState = matchingValues.map(selectedState => {
        return`
        <h2 id="haunted-title">${selectedState.location}</h2>
        <div id="rendered-story">
            <p class="story-label">City:</p><p class="story-text">${selectedState.city}</p><br>
            <p class="story-label">State:</p><p class="story-text"> ${selectedState.state}</p><br>
            <p class="story" id="the-story">${selectedState.description}</p>
        </div>
        `
    })

    const selectedStateLongStories = sameState.filter((longStory) => {
        return longStory.length > 400
    }) 

    const randomSelectedStateStory = selectedStateLongStories[Math.floor(Math.random() * selectedStateLongStories.length )]     
    
     //*** Target paragraph for AI use ***//
    // Create a temporary element to parse the HTML content
    const tempElement = document.createElement('div')
    tempElement.innerHTML = randomSelectedStateStory

    //Access story div from randomStory
    const storyDivTemp = tempElement.querySelector("#the-story")
    const storyStateInput = storyDivTemp.textContent
        
    const response = await openai.completions.create({
        model: 'gpt-3.5-turbo-instruct',
        prompt: `Referring to the following statement, fix all grammatical errors and expand on it by a few sentences - making it slightly more spooky but do not drift away from original story. Make sure it has a proper ending. Remove any URLs found within the following or anything that may lead to an external website: ${storyStateInput}`,
        max_tokens: 3000,
        temperature: 1
    })

    const generatedStoryStateValue = response.choices[0].text.trim()     
    
    aiEnhanced.innerHTML = `
    <div class="story" id="AI-enhanced-story">     
        ${randomSelectedStateStory}    
        ${generatedStoryStateValue}        
    </div> 
    `        
}
