---
layout: post
title: "Psychonautgirl's design & how to make a self-drawing drawing with processing"
comments: true
description: "A new design for psychonaut girl"
keywords: "design"
---

# A new design for a psychonaut girl

I've been wanting to change my website's design for quite a long time now. It's an old design and it doesn't represent who I am anymore.
I'm tired of this super pink 🌟 corny thing ugh.

![psychonaut](/assets/blog/psychonaut.png)

I think design is super cool but unfortunatly I never took the time to study it so I'm not great at it and the best way I found to create something new was to get a lot of references from people who are awesome at creating stuff.

 Because I think my currently website is \*too MUCH\* I wanted to implement a more minimalist thing this time. I've been flirting a lot with geocities, 90's, oldschoolishy designs and I want to get a result as cool as Jenn's [site](http://jennmoney.biz/) by the end of this project. So I have a lot of confusing design ideas in my head (because let me tell you it's not easy to abstract the beauty on geocities websites' designs) and I remembered a project I contributed to a couple of years ago called Beyond Activismo. They have this awesome logo:

![beyond_actvismo_logo](/assets/blog/beyond_logo.png)

And by the time I contributed they had a video that showed their logo drawing itself, like completing the dots and I thought it was wild!

# D draw!

I decided I wanted something like Beyond Actvismo had in my website and I thought it'd be better to do that with my hacking skills rather than with my art skills. So I did it and here is kind of my step-by-step guide so you can reproduce it in your home. This was my first try:

![girl](/assets/blog/girl.gif)

I'm not great at drawing, so what I did was get a reference image from the internet and I tried to drawing something alike. I chose this cool drawing by Tara Anand. Tara's drawing is on the left and mine on the right:

![comparing_girls](/assets/blog/comparing_girls.png)

I designed a canvas that allows me to upload a reference image from my computer, that lets me drawing lines on it and also gives me the coordinates of those lines. The code to this canvas can be found [here](https://gist.github.com/marimeireles/ff03c44321b4e891f3e0c0a6ca9984f7). You can save it as an .html file and run it in your computer!

After contouring my reference image I got all the coordinates I needed from my devtools log:

![coords.png](/assets/blog/coords.png)

I edited the coordinates with my fav text editor and created some big integer arrays with them.

I've used this lib called [p5js](https://p5js.org) that is an implementation in javascript of Processing with this [code](https://gist.github.com/marimeireles/37b104e1fcf6b0ad9c65a08087fdf182) and that thing up there is what I got!

The more lines you make the more the self-drawing drawing will look like your original draw. p5js offers a lot of different objects and shapes that may fits your drawing best than just using lines like I did.

I decided not to use this drawing as a central piece of my website design because it didn't click to me as much as I thought it would but I wanted to share it anyway! I still have no clue of where to go from here, if you have some cool tips about design to give me I wanna hear them! Find me on the web and tell me about it.

Processing is a really cool tool and you can get some awesome results out of it. Feel free to use and modify this small tool I created. If you create something cool with it, let me know!


