---
layout: post
title: "This is a journey in to HTTP/2: Diving in to performance analysis the push"
comments: true
description: "This is a journey in to HTTP/2 - Diving in to performance analysis: the push"
keywords: "mozilla, personal"
---

This post is the continuation of the series “This is a journey in to HTTP/2”, you’ll find the first post where I talk about the difference between HTTP protocols [here](https://medium.com/@electrika01/this-is-a-journey-into-http-2-building-blocks-cba57a1e924c) and the second one where I advise whether you should or not use HTTP/2 on your own website [here](https://psychonautgirl.space/blog/2019/01/01/journey-into-http2-should-i-use-it.html). On this post we’ll explore how to find the configuration that fits your needs. Better than giving you a formula that might or might not work for you I’ll try to show you how to find the result that’s going to be optimal for your website.

## Initial setup

There are a lot of tools out there to help you evaluate your website’s performance. Here I decided to use Firefox DevTools, Chrome DevTools and [sitespeed.io](https://www.sitespeed.io/) by Wikimedia. Why these tools? They’re simple, easy to use, very customizable and they will cover a representative part of what HTTP/2 is doing in our website. Besides that Firefox, and Sitespeed offer a wide set of awesome open source tools and as a conscious developer that fights for the free web you should contribute with these companies by using them. To run tests on your computer use a real mobile device if you can, I recommend using a Nexus 5. If you don’t have a Nexus 5 at your disposal any mid-range device will do, this [list](https://twitter.com/katiehempenius/statuses/1067969800205422593) might help you to find something. Concerning internet speed I advise you to use a 5mbps internet connection. If you have a slower internet connection at your disposal it’s fine to run the tests with a lower speed, just remember to use a tool like [Throttle](https://www.sitespeed.io/documentation/throttle/) to establish a speed your internet supports. Note that if you have an internet speed faster than 5mbps you will also need to throttle it down. To run tests on mobile I believe the 3g slow speed or 300kbps is a good one. You can check how much speed you have at your disposal looking at [fast.com](https://fast.com/) and if you’re still feeling insecure about how your network is behaving you can use a tool like [Wireshark](https://www.wireshark.org/) to monitor it closer.

If you’re not comfortable with these tools Google has a great [doc](https://developers.google.com/web/tools/chrome-devtools/) about how to use DevTools and Firefox [too](https://developer.mozilla.org/en-US/docs/Tools), Sitespeed also have some fine [docs](http://sitespeed.io/documentation/). If you don’t want to learn this kind of thing right now and just jump straight away for the tests and results you can try using [WebPageTest](http://webpagetest.org/), it’s great tool and it’s also open source 🎔. WebPageTest is not as customizable as the tools I first advised you to use, but it’s possible to change a lot of settings on the website, so if you’re looking for simpler tests you should go have a look, it’s really a great tool. I recommend the same settings as I did before: using Nexus 5 for running tests with a slow 3g connection and Chrome and Firefox with a 5mbps connection.

I recommend you to use this setup because according to my [previous research](https://psychonautgirl.space/webcompat.html#Nexus-5) Nexus 5 represents the average setup of a mobile nowadays and the internet speeds also represents the average speed connection throughout the world. If you have more accurate statistics for your main users go ahead and use them!

To clarify things here this is the setup I’m using:

```
Server: ngnix 1.14.2
Desktop: MacBook Pro 2018 Mojave
Mobile: Nexus 5 Android 7
Internet speed: 2mbps/300kbps
```

P.S.: I have to use 2mbps to run my tests because my internet is currently that bad.

## Defining priorities

Performance is about an ocean, you can swim for miles in a lot of different directions but if you don’t focus chances are you’ll be lost in a sea of testing and hardly any insights or improves will come out from there.

![xkcd](/assets/blog/time-cost-xkcd.png)


source: [xkcd](http://xkcd.com/)

It’s important that you find what are the crucial points that need to be upgraded in your website to avoid getting lost. In my case the main aspects I want to improve are **time to first paint** and **time to be interactive**. Once you find what are your main aspects try to identify which files are responsible for triggering them, on my case I found out that two bundle files containing all of the page JS and CSS were the files that dictated the website performance if taking in account these two aspects.

Besides that define which are the most important pages that you want to optimize and focus on those, in my case I’m most interested in improving the performance of webcompat.com, webcompat.com/issues/new and webcompat.co/issues/#.

Another important thing to decide is whether it’s actually valuable for you to run tests using mobile. Running tests on mobile is a boring task, it’s super slow and they’re not the easiest creatures to handle, so if it’s not relevant for your context (which is rare nowadays) I’d say you could skip it. You can use [Lighthouse](https://developers.google.com/web/tools/lighthouse/) to give you an overview about how your website is handling mobile and maybe if you get good results you could also skip the mobile tests. In my case mobile is relevant because it’s where webcompat has the lowest scores when I run this kind of test and also because a substantial part of our traffic comes from mobile.

![traffic](/assets/blog/traffic-webcompat.png)

## Pre analysis

The `push` resource has to be used carefully for a couple of reasons, for example it interferes directly with your first paint time, so you have to take watch the size of the files you’re pushing, according to [this](https://docs.google.com/document/d/1K0NykTXBbbbTlv60t5MyJvXjqKGsCVNYHyLEXIxYMv0/edit#) article you should `push` files to fill your idle network time and no more. Using DevTools should make fairly simple to find out how much idle time we have between the time an user makes a request and your website starts responding it. You can also check this [link](https://stackoverflow.com/questions/667555/how-to-detect-idle-time-in-javascript-elegantly) to learn how to do it “elegantly”. Here are my results:

![idletime](/assets/blog/idle-time.png)

Webcompat’s idle time. Time in ms.

To get an idea of how HTTP/2 is going to change things I first measured the performance of my website without any change. You can measure this using Speedtest or Devtools. I recommend to use Speedtest because it’ll probably make your life easier, but if you want to run tests on DevTools it’s okay too. Keep in mind that you should create a new profile to do so, so your addons, cookies, etc don’t have any effects on your profiling, this is a very important step since extensions can have a [profound impact on your performance](https://twitter.com/denar90_/statuses/1065712688037277696).

![wpdefault](/assets/blog/wpdefault.png)
Webcompat’s performance with no changes. Time in ms.

Some explanation here: the “/” stands for webcompat.com, the “new” for webcompat.com/issues/new and the “396” for webcompat.com/issues/396, a random issue.

## The plan

`Push` will send the files you chose for the user before the user browser even requests them and this is the main difference from preloading, but there is a lot of specificities about it and if you’re interested, there is a great [article](https://dexecure.com/blog/http2-push-vs-http-preload/) explaining more about them. Because of that we don’t want to push the files every time the user access our page we only want to send them when it’s needed. To do that a good solution is to create a cookie that will indicate to the server if the user needs new information to be pushed or if it doesn;t and the user already has this info cashed on the browser. If you want to learn more about cookies the [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) page is a nice starting point. Here is an example on how to create a session cookie on nginx:

```
server {
[...]
    http2_push_preload on;
    location = / {
        add_header Set-Cookie "session=1";
        add_header Link $resources;
    }
}

map $http_cookie $resources {
    "~*session=1" "";
    default "</style.css>; as=style; rel=preload, </image1.jpg>; as=image; rel=preload";
}
```

Since we know how much idle time we have we can estimate how many files we can `push`. In my case I’ll be pushing only two huge bundle files that are critical for my performance improvement. But in case my estimates are wrong I’ll also run tests pushing more files than I think the website can handle. I’ll also run some tests using the HTTP/2 server but not pushing anything so I can analyze how much pushing files are improving performance.

While running the tests I’m interested in looking at four different aspects of the website: time to first paint, speed index, time to start render and time to load all the requests. You can chose the parameters that make more sense to your website. But careful not to take too many things in consideration. Testing a lot of different aspects will not always give you a more accurate answer, in my experience is quite the opposite, testing things that might be unrelated just gave me a lot of work and confusing results.

To summarize we’ll be testing the following:
* Default HTTP/2 server (not pushing any files);
* Pushing the most crucial files and keeping inside the idle time budget;
* Pushing more files than the available idle time.

Besides that maybe it might be smart to use `preload` as a complement to the files that couldn’t be pushed. It depends on your currently situation, in my case I decided it wasn’t a priority but I’ll come back to it later on this post and I’ll try to give you some insights about it.

## The test analysis

To make the next tests I’ll use Sitespeed! Sitespeed offers you the option to load your configuration as a JSON file, this is the file I used to run my tests:

```
{
  "browsertime": {
    "iterations": 5,
    "browser": "BROWSER"
  },
  "utc": true,
  "outputFolder": "OUTPUT_FOLDER"
}
```

And this is the command line I used to run tests on my desktop: `docker run --shm-size=1g --rm -v "($pwd)":/sitespeed.io sitespeedio/sitespeed.io:7.73 --config config.json https://staging.webcompat.com` .

I wanted to make this report as accurate as possible so I decided to write a Selenium script to login on my website while I was testing. I recommend you looking in to Selenium and Sitespeed docs if you’re interested in creating something alike. The script is pretty straightforward and here is the one I used:

```
module.exports = {
  run(context) {
    return context.runWithDriver((driver) => {
      return driver.get('LOGIN_HTML')
        .then(() => {          
          const webdriver = context.webdriver;
          const until = webdriver.until;
          const By = webdriver.By;

          const userName = 'USER_LOGIN';
          const password = 'USER_PASSWORD';
          driver.findElement(By.name('login')).sendKeys(userName);
              
          driver.findElement(By.name('password'))
                             .sendKeys(password);
          const loginButton = driver.findElement(
                                     By.classN* Firefox had a performance consistently worse than Chrome’s on desktop that’s worth an investigation. According to previous tests done on other tools like DevTools and WebPageTest they didn’t used to have such a disparate performance;

                                    *
                                 In most of the cases just upgrading the server to HTTP/2 doesn't make much difference. I imagine that most of the performance improvement comes from nginx HPACK;
Even though the time to first paint didn't improve as much as I expected on the single issue page while I was pushing more than just the bundle files on Chrome mobile the TTI had a huge performance increase;
If comparing the Speed index the performance was worse in all of the devices in the new issue page while I was pushing more than just the bundle files, which means the new issue page have a smaller idle time and I shouldn't push as many files as I did.ame('btn-block'));
          loginButton.click();
          return driver.wait(until.elementLocated(
                                   By.id('body-webcompat')), 3000);
        });
    })
  }
};
```

While running the tests on my Nexus 5 I’ve used the following command: `sitespeed.io --browsertime.chrome.android.package com.android.chrome --preScript login_mobile.js --config config.json https://staging.webcompat.com` , you can learn more about how to use your mobile to run tests on Sitespeed reading their docs. Keep in mind that you have to redirect the user from the login page to the page you want to test directly, otherwise the browser will just cache the information from your first loaded page to the page you’re really trying to test. Maybe this issue explains a little better what I mean.

Using all of the knowledge above we can finally run some tests and analyze the results.

![traffic](/assets/blog/2only.png)
Webcompat’s performance without pushing anything. Time in ms.

![traffic](/assets/blog/2budgetok.png)
Webcompat’s performance pushing only crucial files. Time in ms.

![traffic](/assets/blog/2budgetnotok.png)
Webcompat’s performance pushing more files than idle time supports. Time in ms.

Seeing this data we can observe a few interesting things:

* Firefox and Chrome mobile have a bigger idle time than Chrome, so these environments benefit more from push . While pushing more than the budget I had estimate was better for Firefox and Chrome mobile it meant a worsen in performance for Chrome desktop;
* Firefox had a performance consistently worse than Chrome’s on desktop that’s worth an investigation. According to [previous tests](https://psychonautgirl.space/webcompat.html) done on other tools like DevTools and WebPageTest they didn’t used to have such a disparate performance;
* In most of the cases just upgrading the server to HTTP/2 doesn't make much difference. I imagine that most of the performance improvement comes from nginx [HPACK](https://blog.cloudflare.com/hpack-the-silent-killer-feature-of-http-2/);
* Even though the time to first paint didn't improve as much as I expected on the single issue page while I was pushing more than just the bundle files on Chrome mobile the TTI had a huge performance increase;
* If comparing the Speed index the performance was worse in all of the devices in the new issue page while I was pushing more than just the bundle files, which means the new issue page have a smaller idle time and I shouldn't push as many files as I did.

If you want to further optimize your website you can try to use preload. I encourage you to read [this article](https://www.keycdn.com/blog/http2-hpack-compression) about preloading to find out if it’s worth it for you. Generally if you have any of the following on your website it might be a good idea to use it:

* Fonts referenced by CSS files;
* Hero image which is loaded via background-url in your external CSS file;
* Critical inline CSS/JS.

Currently the website I'm testing doesn't have any critical inline CSS /JS, nor hero image and our fonts are hosted by third-parties. So I decided I wouldn’t make any changes by the time, since I was currently focusing on the push performance. If you’re planning to do that on your website keep in mind that we’ve used `http2_push_preload` on nginx and now we can’t preload the files on the server anymore because it’s set to default that all of the preloaded files should be pushed. Instead of using the server configuration file and sending them on headers you’ll have to use the `preload` tag on HTML files.

## Conclusion

Analyzing the data I got to the conclusion that for my website I should use the `push` resource on a few other files than I had first planned. I learned that using `push` was specially helpful on single issue pages and on the homepage and that the new issue page has a small idle time and I shouldn’t push as much resources as I push to the rest of the website, or it will start to get in the way of the page rendering.

I hope this article had helped. Let me know if I missed anything!