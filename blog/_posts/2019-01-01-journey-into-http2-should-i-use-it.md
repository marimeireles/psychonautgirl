---
layout: post
title: "This is a journey into HTTP/2: should I use it on my website?"
comments: true
description: "This is a journey into HTTP/2: should I use it on my website?"
keywords: "http2, server, performance"
---


In my [previous blog post](https://psychonautgirl.space/blog/2018/12/20/journey-into-http2-building-blocks.html) I gave a small introduction on the main differences between the HTTP protocols. In this article I want to help you understand if you need HTTP/2 on your website and if you decide you do, how to use the `push`resource to improve your website speed.

### Is HTTP/2 worth it?

Even  though using HTTP/2 is broadly advertised on the internet as the best possible option I don't believe it fits everybody needs. Here are some things to consider if implementing HTTP/2 is worth it for you:

 * It's not supported by older browsers. You can check [here](https://caniuse.com/#search=http2) which browsers supports HTTP/2. If you know your user base access your website mainly from these browsers, it might not be worth it. Maybe it'll be more worthy of your time to look for optimizations using HTTPv1.1, that can also help a lot;

 * It's not supported by some web servers. You should check if your current server supports HTTP/2, [here](https://github.com/http2/http2-spec/wiki/Implementations) is an updated list on which servers currently support it;

 * It's not supported by some content delivery network you should check it either by looking at their website or checking this [list](https://en.wikipedia.org/wiki/HTTP/2#Content_delivery_networks);

 * Upgrading your whole ecosystem to run a HTTP/2 server might mean you'll spend a lot of work &/or money, besides upgrading your web server and your content delivery network you might need to buy a certificate, you can find more information about it [here](https://letsencrypt.org/getting-started/);

 * Unfortunately using HTTPS doesn't assure HTTP/2 is a safe mean to transfer data in the web since it doesn't deal with cookies, for example, which are a major privacy problem. Also, you can [upgrade your HTTPv1.1 server to HTTPS](https://support.google.com/webmasters/answer/6033049). HTTPS alone is not a good reason to upgrade. Besides that this [article](https://queue.acm.org/detail.cfm?id=2716278) advocates some other reasons explaining how HTTP/2 is not as safe as we think it is;

 * Updating your web server might mean only a small improvement on loading time and sometimes it might mean a loss in performance. I showed this happening in some cases on this [analysis](https://psychonautgirl.space/webcompat.html#HTTP-2) on webcompat.com using HTTP/2 and [this](https://dev.to/david_j_eddy/is-http2-really-worth-it-1m2e) and [this](https://blog.fortrabbit.com/http2-reality-check) blog posts reiterate it. The only way to find out if it's going to be worth it to your website is running a lot of tests.

 If you think all of the points above aren't a real issue for you -or if you're willing to deal with them, let's dive in to how to analyze your website! In my next post I'll show you the methods and tools I used to analyze staging.webcompat.com and hopefully this real life example will help you to improve the performance of your own website.