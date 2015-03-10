var hoverTweet;
var mousePos;
var hoverTweetPos;
var boxWidth = 400;
var loadedTweets = new Map();

var modKey = 17;
var modPressed = false;


$(document).ready(initializeHoverTweet);


$(document).keydown(function(e) {
	if (e.which == modKey)
	{
		modPressed = true;
	}
});

$(document).keyup(function(e) {
	if (e.which == modKey)
	{
		modPressed = false;
	}
});

$(document).bind('mousemove', function(e) {
	if (modPressed)
	{
		return;
	}
	var target = $(e.target);
    if (target.is("a")) {

    	var tweetUrl = target.attr('href');
    	if (tweetUrl.match("http(s){0,1}://((m.)|(mobile.)|(www.))?twitter.com/.*/status(es)?/\d*"))
    	{
    		//trim www or m or mobile, make sure it's https
    		tweetUrl = "https://"+tweetUrl.substring(tweetUrl.search("twitter.com"));
    	}else{
    		// not a twitter url
    		return;
    	}

    	initializeHoverTweet();

    	// Position tweet at mouse position (+10,+10)
        mousePos = {top:e.pageY,left:e.pageX};
        

        calculatePosition();
        if (hoverTweetPos)
        {
        	hoverTweet.css(hoverTweetPos);
        }
		

		
		hoverTweet.show();


		target.bind('mouseout', function(ev) {
			if (!modPressed)
			{
				hoverTweet.hide();
			}
        });

        




		if (loadedTweets.has(tweetUrl))
		{
			// Already downloaded info for specified tweet
			var tweetInfo = loadedTweets.get(tweetUrl);
			populateHoverTweet(tweetInfo);
		}else{

			
			loadedTweets.set(tweetUrl,"Loading...");
			
			$.ajax({
		       url: tweetUrl,
		       type: "GET",
		       dataType: "text",
		       success: function(data) {


		       		markLinkVisited(target);

					var username = extractInterior(tweetUrl,"https://twitter.com/","/");

					//console.log("Username: "+username);

					var message = extractInterior(data,'data-aria-label-part="0">','</p>');

					//console.log("Message: "+message);

		        	var fullName = extractInterior(data,'data-screen-name="'+username+'" data-name="','"');

		        	//console.log("Full Name: "+fullName);

		        	var imageUrl = extractInterior(data,'<meta  property="og:image" content="','">');

		        	//console.log("Image URL: "+imageUrl);


		        	var tweetInfo = {full:fullName,un:username,msg:message,img:imageUrl};
		        	loadedTweets.set(tweetUrl,tweetInfo);


		        	populateHoverTweet(tweetInfo);

		       }
		    });
		}
        		
    }
});



function calculatePosition()
{
	var top = mousePos.top+10;
	var left = mousePos.left+10;

	var hOverflow = left+boxWidth-$(window).width();

	if (hOverflow > 0)
	{
		left -= hOverflow;
		if (left < 0)
		{
			left = 0;
		}
	}


	hoverTweetPos = {'top':top,'left':left};

}


function initializeHoverTweet()
{
	if (!hoverTweet)
	{
		hoverTweet = $('<div id="hoverTweet"></div>').appendTo(document.body);
	}
	
	var css = {
			'border':'1px solid #ccd6dd',
			'border-radius':'10px',
			'padding':'10px',
			'margin':'1px',
			'max-width':boxWidth,
			'position':'absolute',
			'z-index':2147483647,
			'background-color':'#f5f8fa',
			'font-family':'"Gotham","Helvetica Neue","Helvetica",sans-serif',
			'font-size':'20px',
			'box-shadow':'2px 2px 2px #ccd6dd',
		};
	hoverTweet.css(css);
	hoverTweet.hide();
}

function populateHoverTweet(tweetInfo)
{
	hoverTweet.empty();
	if (tweetInfo.full == undefined)
	{
		var loading = $('<p>Loading...</p>');
		var loading_css = {'color':'#66757f','font-size':'18px'};
		loading.css(loading_css);
		hoverTweet.append(loading);
	}else{

		var imgDiv = $('<div />');
		imgDiv.css({'float':'left','margin-right':'10px'});
		var namesDiv = $('<div />');

		var img = $('<img src="'+tweetInfo.img+'" />');
		var img_css = {'height':'50px','width':'50px','border-radius':'5px'};
		img.css(img_css);

		var fn = $('<a href="https://twitter.com/'+tweetInfo.un+'" target="_blank">'+tweetInfo.full+'</a>');
		var fn_css = {'color':'#292f33','font-weight':'bold','font-size':'20px'};
		fn.css(fn_css);

		var un = $('<p>@'+tweetInfo.un+'</p>');
		var un_css = {'color':'#8899a6','font-style':'italic','font-size':'16px'};
		un.css(un_css);

		var msg = $('<p>'+tweetInfo.msg+'</p>');
		var msg_css = {'color':'#292f33','font-size':'18px','float':'left'};
		msg.css(msg_css);



		imgDiv.append(img);
		namesDiv.append(fn);
		namesDiv.append(un);
		hoverTweet.append(imgDiv);
		hoverTweet.append(namesDiv);
		hoverTweet.append(msg);
	}
}

// Doesn't last beyond current view of page. Need alternate solution to preserve between refreshes/reloads.
function markLinkVisited(link)
{
	link.addClass('visited');
}


// extracts and returns the string between beforeString and afterString from dataString
// for example:
// dataString = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
// beforeString = "JKLMN"
// afterString = "STUVW"
// returns "OPQR"
function extractInterior(dataString, beforeString, afterString)
{
	var beforePosition = dataString.indexOf(beforeString)+beforeString.length;
	var afterPosition = dataString.indexOf(afterString,beforePosition);
	return dataString.substring(beforePosition,afterPosition);
}
