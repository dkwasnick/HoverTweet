var hoverTweet;
var mousePos;
var hoverTweetPos;
var boxWidth = 400;
var loadedTweets = new Map();


$(document).ready(initializeHoverTweet);


$(document).bind('mousemove', function(e) {
	var target = $(e.target);
    if (target.is("a")) {

    	var tweetUrl = target.attr('href');
    	if (tweetUrl.match("http(s){0,1}://((m.)|(mobile.)|(www.))?twitter.com/.*/status/\d*"))
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
        	hoverTweet.hide();
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

					/*
					Possible alternate source for populating tweet contents
					<meta  property="og:type" content="article">
			        <meta  property="og:url" content="https://twitter.com/Matt_Barnes22/status/572993563673415680">
			        <meta  property="og:title" content="Matt Barnes on Twitter">
			        <meta  property="og:image" content="https://pbs.twimg.com/profile_images/495822736812290048/yX_yk8KZ_400x400.jpeg">
			        <meta  property="og:description" content="“Check this dope 2pac piece out by @keenanchapman make sure you check him out! Wats your favorite pac… https://t.co/MWF939NcmU”">
			        <meta  property="og:site_name" content="Twitter">
			        <meta  property="fb:app_id" content="2231777543">
			        */

					var beforeUsername = "https://twitter.com/";
					var usernameStart = beforeUsername.length;
					var usernameEnd = tweetUrl.indexOf("/",usernameStart);
					var username = tweetUrl.substring(usernameStart,usernameEnd);

					//console.log("Username: "+username);


					var messageSearchString = 'data-aria-label-part="0">';
					var messageStart = data.indexOf(messageSearchString)+messageSearchString.length;
					var messageToEnd = data.substring(messageStart);
					var messageEnd = messageToEnd.indexOf('</p>');
					var message = messageToEnd.substring(0,messageEnd);

					//console.log("Message: "+message);




		        	var titleStart = data.search("<title>")+7;
		        	var titleEnd = data.search("</title>");
		        	var title = data.substring(titleStart,titleEnd);


		        	var fullNameEnd = title.indexOf(" on Twitter");
		        	var fullName = title.substring(0,fullNameEnd);

		        	//console.log("Full Name: "+fullName);

		        	var newmessageSearchString = "on Twitter: &quot;";
		        	var newmessageStart = title.indexOf(newmessageSearchString)+newmessageSearchString.length;
		        	var newmessageEnd = title.lastIndexOf("&quot;");
		        	var newmessage = title.substring(newmessageStart,newmessageEnd);

		        	//console.log("Backup Message: "+newmessage);

		        	var imageSearchString = '<meta  property="og:image" content="';
		        	var imageStart = data.indexOf(imageSearchString)+imageSearchString.length;
		        	var imageEnd = data.indexOf('">',imageStart);
		        	var imageUrl = data.substring(imageStart,imageEnd);

		        	//console.log("Image URL: "+imageUrl);

		        	if (messageStart < 0)
		        	{
		        		message = newmessage;
		        	}


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

	var overflow = left+boxWidth-$(window).width();

	if (overflow > 0)
	{
		left -= overflow;
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

		var fn = $('<p>'+tweetInfo.full+'</p>');
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