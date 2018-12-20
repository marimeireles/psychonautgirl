---
layout: post
title: "This is a journey into HTTP/2: building blocks"
comments: true
description: "This is a journey into HTTP/2: building blocks"
keywords: "http2, server, performance"
image: /assets/images/http-compare.png
---

As a performance intern working with the Webcompat team part of my initial proposal was to update the Webcompat server to HTTP/2. But what is HTTP/2? What's the difference between HTTP1.1, HTTPS and HTTP/2? Newer is always better? How should I know if I should implement it on my website? We'll dive in into the basics and I'll give you the building blocks to understand a little bit about internet protocols and in later articles I'll introduce you to my process of analysis and implementation of an HTTP/2 server focused on improving Webcompat's website performance, hopefully that will give you some insights about how to improve your own server performance.

HTTP1.1 stands for Hypertext Transfer Protocol version 1.1 and it's a standardized way of computers talk to each other through hyperlinks. HTTP1.1 defines **methods** like GET that retrieves data and POST that sends it, those requests and responses have to be treated synchronous opening one TCP connection for each one of them, which might slow things a bit; HTTP1.1 implements **status** there are responses to the methods like 404 not found or 200 that means that a request was successful;and HTTP **header** fields, which sometimes can be used to fetch data with the HEAD method. HTTP is stateless, which means there is no link between two requests being successively carried out on the same connection, sometimes you may to have a "memory" to store preferences of an user or a cart on an e-commerce and for that HTTP implements **cookies**. HTTP also defines **caching**, a very relevant tool for performance. Caching is the way to save data locally in order to decrease the number of requests you have to make to another computer, W3C offers [extensive documentation](https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html) about it. If you want to get a deeper understanding on how HTTP1.1 works MDN has this [great overview article](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview) about it, you can follow up the links, I recommend reading the entire section.

![http11](/assets/images/http-1.png)

[source: cloudflare](https://blog.cloudflare.com/http-2-for-web-developers/)

HTTPS is a safer way to transfer data between computers. HTTPS websites encrypts the data you send and receive using TLS/SSL and the websites have to be certified by authorities on the internet that ensures that you are exchanging information with who you think you are, here is a link if you're interested in learning more about HTTPS. When we're talking about performance it seems obvious that HTTPS will have a bigger cost than HTTP because of the extra encrypting process, but according to this website's tests their results are pretty similar with HTTPS being approximately 1% slower than HTTP.

Finally, HTTP/2 implements the same tools that HTTP1.1 does, but on top of that it has some sweet new things. HTTP/2 as opposed to HTTP1.1 is a multiplexed protocol which means it can handle parallel requests; it's implemented with a is a binary protocol which allows the use of improved optimization techniques; it compresses headers; and it allows a server to populate data in a client cache, in advance of it being required, through a mechanism called the server push. Besides that, all of the browsers only support HTTP/2 if they're over TLS which means they're always encrypted.


![http11](/assets/images/http-compare.png)

[source: cloudflare](https://blog.cloudflare.com/http-2-for-web-developers/)


These are the basic differences between the three protocols. Now that you have your feet wet on the water it's time to learn how to run analysis and find out if HTTP/2 is good for you.