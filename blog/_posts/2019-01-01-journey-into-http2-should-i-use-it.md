---
layout: post
title: "This is a journey into HTTP/2: should I use it on my website?"
comments: true
description: "This is a journey into HTTP/2: should I use it on my website?"
keywords: "http2, server, performance"
---


In my [previous blog post](https://psychonautgirl.space/blog/2018/12/20/journey-into-http2-building-blocks.html) I gave a small introduction to the main differences between the HTTP protocol versions. In this article I want to help you understand if you need HTTP/2 on your website. If you decide you do you can keep following this series of blog posts where I'll upgrade my own website and where I try in the best of my ability to give you some neat tips on how to analyse and upgrade yours!

### Is HTTP/2 worth it?

Even though using HTTP/2 is broadly advertised on the internet as the best possible option I don't believe it fits everybody needs. Here are some things to consider if implementing HTTP/2 is worth it for you:

 * It's not supported by older browsers. You can check [here](https://caniuse.com/#search=http2) which browsers support HTTP/2. If you know your user base accesses your website mainly from these browsers, it might not be worth it. Maybe it'll be a better use of your time to look for optimizations for HTTP/1.1, those can help a lot;

 * It's not supported by some web servers. You should check if your current server supports HTTP/2, [here](https://github.com/http2/http2-spec/wiki/Implementations) is an updated list on which servers currently support it;

 * It's not supported by some content delivery networks. You should check it either by looking at their website or checking this [list](https://en.wikipedia.org/wiki/HTTP/2#Content_delivery_networks);

 * Upgrading your whole ecosystem to run a HTTP/2 server might mean you'll spend a lot of time/money. Besides upgrading your web server and your content delivery network, you might also need to buy a certificate, you can find more information about it [here](https://letsencrypt.org/getting-started/);

 * You can [upgrade your HTTP/1.1 server to HTTPS](https://support.google.com/webmasters/answer/6033049), so access to HTTPS alone is not a good reason to upgrade to HTTP/2. HTTP/2 isn't intrisically safe and this [article](https://queue.acm.org/detail.cfm?id=2716278) goes over some reasons why;

 * Updating your web server might mean only a small improvement on loading time and sometimes it might mean a loss in performance. I've seen this happening in some cases while [analysing webcompat.com with HTTP/2](https://psychonautgirl.space/webcompat.html#HTTP-2), and [other](https://dev.to/david_j_eddy/is-http2-really-worth-it-1m2e) [people](https://blog.fortrabbit.com/http2-reality-check) have seen the same. The only way to find out if it's going to be worth it for your website is by running a lot of tests.

 If you think all of the points above aren't a real issue for you - or if you're willing to deal with them, let's dive in to how to analyze your website! In my next post I'll show you the methods and tools I used to analyze staging.webcompat.com and hopefully this real life example will help you to improve the performance of your own website.