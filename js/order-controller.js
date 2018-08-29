/* Order Controller */

var MickmanAppLogin = MickmanAppLogin || {};

MickmanAppLogin.OrderController = function () {
    this.$storePage = null;
    this.$btnAdd = null; 
};

//gather the variables that we will need 
MickmanAppLogin.OrderController.prototype.init = function () {
    this.$storePage = "#page-checkout";
    checkGroup('orderBuild');
    console.log("init");
    $(".print-message").addClass('bi-invisible');
	$(".print-message").removeClass("bi-ctn-err");
	$(".print-message").html("");
};

//create custom db per user - new #1.23
MickmanAppLogin.OrderController.prototype.CreateOrderDB = function (name,id) {
	orderdb = "order"+name+"-"+id;
	orderdb = localforage.createInstance({ //Orders Database
		name: orderdb
	});
	console.log(orderdb);
}
MickmanAppLogin.OrderController.prototype.markorderDelivered = function (x) { 
	//alert("do stuff here - aka mark the internal db - toggle item"+x);
	var savedOrder = [];
	var sendData;
	var deliveredFlag = 0;
	var personalData = [];
	var orderData = [];
	orderdb.getItem(x).then( function(value){
		savedOrder = value;
		personalData = value[0];
		orderData = value[1];
		if(savedOrder[4] == 0){
			deliveredFlag = 1;
		}else{
			deliveredFlag = 0;
		}
		console.log(":"+deliveredFlag);
		sendData = [personalData,orderData,savedOrder[2],savedOrder[3],deliveredFlag];
		console.log(sendData);
		orderdb.setItem(x,sendData).then( function(){
			app.orderController.buildOrders();//refresh the Orders
		});
	});
};
//add orders
MickmanAppLogin.OrderController.prototype.addorderDatatoPopup = function (x) { //add order data to the popup then open it.
	orderdb.getItem(x).then( function(value){
		$('#popupOrder div').html("");
		var orderNum = x.split("-");
		$('#popupOrder div').append("<h3>Order Details</h3>");
		var contact = "<p><strong>"+orderNum[1]+"</strong>";
		contact += "<span style='display:block'>"+value[0][1] + " " + value[0][2]+"</span>";
		contact += "<span style='display:block'>"+value[0][3]+"</span>";
		contact += "<span style='display:block'>"+value[0][4] + " " + value[0][5] + "," +  value[0][6] +"</span><br>";
		contact += "<span style='display:block'><strong>Phone: </strong>"+value[0][7]+"</span>";
		contact += "<span style='display:block'><strong>Email: </strong>"+value[0][9]+"</span>";
		contact += "</p>";
		contact += "<p><span style='display:block'><strong>Payment Status: </strong>"+value[2]+"</span></p>";
		var orders = "<div>";
		var total = 0;
		orders += "<br><p><strong>Order Details</strong></p>";
		for(y=0;y<value[1].length;y++){
			orders += "<p style='display:block'>"+value[1][y][0]+ " x " +value[1][y][1][1] + " " + format1(value[1][y][1][0], "$") + "</p>";
			total += Number(value[1][y][1][1])*Number(value[1][y][1][0]);
		}
		
		orders += "</div>";
		
		orders += "<p><strong>Order Total:</strong> <span>"+format1(total, "$")+"</span></p>";
		$('#popupOrder div').append(contact);
		console.log(orders);
		$('#popupOrder div').append(orders);
		
		$('#popupOrder').enhanceWithin();
		
		$("#popupOrder").trigger( "updatelayout" );
		$("#popupOrder").popup("open");
		$("#popupOrder").popup("reposition", {positionTo: 'window'});
	}).catch( function(err){
		console.log("Not able to find it." + err);
	});
};

//show orders 
MickmanAppLogin.OrderController.prototype.buildOrders = function(){
	//checkGroup('orderBuild'); //let's try adding this in to make sure that it knows there is an orderdb db to iterate over.
	console.log("build");
	$(".orderList").removeClass("hidden");
	$(".deliveryList").removeClass("hidden");
	$(".orderList").html("");
	$(".deliveryList").html("");
	var evenOdd;
	
	
	if(orderdb){
		
	orderdb.iterate(function(value, key, iterationNumber) {
		//add orders to the listview
		var name = value[0][1] + " " + value[0][2];
		var phone = value[0][7];
		var email = value[0][8];
		var getdate = key;
		var date = getdate.split("-");
		var day = new Date(+date[1]).getUTCDate();
		var month = new Date(+date[1]).getUTCMonth();
		var year = new Date(+date[1]).getUTCFullYear();
		var synced = "synced"+value[3];
		var delivered = "delivered"+value[4];
		console.log("sdf"+delivered);
		var button = key;
		if(iterationNumber % 2 == 0){
			evenOdd = "even";
		}else{
			evenOdd = "odd";
		};
		var row = '<li class="'+evenOdd+" "+synced+'"><a href="#popupName" data-rel="popup" data-name="'+name+'" data-transition="pop" class="namePop"><div class="ui-grid-a"><div class="ui-block-a"><div class="ui-bar">'+Number(month+1) + "/" + day + "/" +  year+'</div></div><div class="ui-block-b"><div class="ui-bar">'+name+'</div></div><</div></a><a href="#popupOrder" class="fullOrder ui-nodisc-icon" data-rel="popup" data-position-to="window" data-orderid="'+key+'"></a></li>';
		
		var deliveredrow = '<li class="'+evenOdd+" "+delivered+'"><a href="#popupOrderID" data-rel="popup" data-orderid="'+date[1]+'" data-transition="pop" class="orderPop"><div class="ui-grid-a"><div class="ui-block-a"><div class="ui-bar">'+date[1]+'</div></div><div class="ui-block-b"><div class="ui-bar">'+name+'</div></div></div></a><a href="#" class="setDelivered ui-nodisc-icon" data-orderid="'+key+'"></a></li>';//new
		
		$(".orderList").append(row);
		$(".deliveryList").append(deliveredrow);//new
	}).then(function(){
		//refresh the listcontroller
		$(".orderList").enhanceWithin().listview("refresh");
		$(".deliveryList").enhanceWithin().listview("refresh");//new
	}).catch(function(err){
		console.log(err);
	});
	}else{
		console.log("nothing in the db yet");
	}
};

//CHECKOUT - CREATE ORDER COMMAND
$(".create-order").click(function () {
	//create an entry in the orders database
	var pdataA = $("#personal-data").val().split(",");
	var orderDate = new Date();
	var orderStamp = pdataA[0]+"-"+orderDate.getTime();
	var cartArr = ["personal"];
	var cartContents = [];
	var cartItems = []; //new to create a promise chain
	var cartLength;
	
	var cartLength = cart.length().then(function(value){
		cart.getItem('default').then(function(){ //check for the default cart settings entry
			cartLength = (value-1); //if its there remove it from the count
		}).catch(function(err){
			cartLength = 1;
		});
	});
	console.log(orderdb);
	//console.log(newcartLength);
	//Key:User-Date, Value:[personal-info,order-info,payment]
	//Create the order record - then when we go through the cart add the orders to the record. 
	orderdb.setItem(orderStamp,[pdataA,"order-info",$("#payment-type :radio:checked").val()]).then( function(){
		cart.iterate(function(value, key, iterationNumber) {//iterate over the cart 
		   if (key != "personal" && key != "defaults") {
		        cartArr.push(key); //push all the keys into an array
		        cartContents.push([key,value]);
				orderdb.getItem(orderStamp).then( function(value){
			        orderdb.setItem(orderStamp,[value[0],cartContents,value[2],0,0]).then( function(){
				        //added a value to track whether it is synced or not
				        //added a value to track whether it is delivered or not - toggle
					        ////if (iterationNumber == (cartLength-1)) { <!-- overkill removed
				        	for(i=0;i<cartArr.length;i++){
								cartItems.push(cartArr[i]); //create a collection to remove
							}
							var promises = cartItems.map(function(item) { return  cart.removeItem(item); });
							Promise.all(promises).then(function(results) {
							    //console.log("r-"+results);
							    if(deliverydate != null){
									//$('#page-order-complete .delivery-time').html(deliverydate);
									$('#OrderComplete .delivery-time').html(deliverydate);
								}
								if(group != null){
									//$("#page-order-complete .group").html(group);
									$("#OrderComplete .group").html(group);
								}
								var orderData = "<h2>Your Order Details</h2>";
								var subtotal = 0;
								//for(y=0;y<pdataA.length;y++){ //personal data
								//orderData += "<a href='#' class='ui-btn closesummary'>Close</a>";
								orderData += "<table class='reciept-table'>";
								orderData += "<tr><td><strong>Name: </strong>"+pdataA[1]+" "+pdataA[2]+"</td></tr>";
								orderData += "<tr><td><strong>Address: </strong>"+pdataA[3]+"</td></tr>";
								orderData += "<tr><td><strong>City: </strong>"+pdataA[4]+"</td></tr>";
								orderData += "<tr><td><strong>State: </strong>"+pdataA[5]+"</td></tr>";
								orderData += "<tr><td><strong>Zip: </strong>"+pdataA[6]+"</td></tr>";
								orderData += "<tr><td><strong>Phone: </strong>"+pdataA[7]+" ["+pdataA[8]+"]</td></tr>";
								orderData += "<tr><td><strong>Email: </strong>"+pdataA[9]+"</td></tr>";
								orderData += "</table>";
								//}
								for(x=0;x<cartContents.length;x++){ //cart data
									orderData += "<table class='reciept-table'><tr><td><img src='"+cartContents[x][1][2]+"' class='cartimg'/></td><td><strong>"+cartContents[x][0]+"</strong><br><p>Quantity:"+cartContents[x][1][1]+"</br>cost per:"+format1(cartContents[x][1][0], "$")+"</p></td></tr></table>";
									subtotal += Number(cartContents[x][1][1])*Number(cartContents[x][1][0]);
								}
								orderData += "<p>Order Subtotal: "+format1(subtotal, "$")+"</p>";
								
								//$("#page-order-complete .order-details").html(orderData);
								$("#OrderComplete .order-details").html(orderData);
								
								//$(':mobile-pagecontainer').pagecontainer('change', '#page-order-complete');//go to next page
								$(':mobile-pagecontainer').pagecontainer('change', '#page-orders');
								
								//openpopup
								$("#OrderComplete").removeClass("hidden");
								
								//clear out the fields 
								$("#personal-fname").val("");
								$("#personal-lname").val("");
								$("#personal-address").val("");
								$("#personal-city").val("");
								$("#personal-state").val("");
								$("#personal-zip").val("");
								$("#personal-phone").val("");
								$("#personal-email").val("");
								    
								});
							
				        ////}
			        }).catch(function(err){
				        console.log("ORDER ARRAY NOT ADDED TO ORDER: " + err);
				    });
		        }).catch(function(err){
			        console.log("ORDER ITEM NOT FOUND TO ADD ARRAY TO: "+err)
		        });
		    }
		}).then(function(result) {
		    //console.log('Iteration has completed, last iterated pair:');
		    //console.log(result);
		}).catch(function(err) {// This code runs if there were any errors
		    console.log("CART ITERATION FAILED: "+err);
		});
	}).catch(function(err){
		console.log("ORDER ITEM NOT ABLE TO BE CREATED: "+err);
	});

});

//buttons
$(document).on('click', '.fullOrder', function(){ //Cart + button  
	app.orderController.addorderDatatoPopup($(this).data('orderid'));
});
$(document).on('click', '.namePop', function(){//send Name to the popup
	$("#popupName p").html($(this).data('name'));
});
$(document).on('click', '.orderPop', function(){//send Name to the popup
	$("#popupOrderID p").html($(this).data('orderid'));
});
//mark as delivered
$(document).on('click', '.setDelivered', function(){//first lets organize the content of the orders
	app.orderController.markorderDelivered($(this).data('orderid'));
});

//sync
$(document).on('click', '.syncOrders', function(){//first lets organize the content of the orders
	//disable the sync button until we hear back or it times out
	$(".syncOrders").addClass('ui-state-disabled');
	$(".print-message").addClass('bi-invisible');
	$(".print-message").removeClass("bi-ctn-err");
	$(".print-message").html("");
	//iterate through the orders and assemble into something to pass to the php
	var token;
	var myID;
	var key = Array();
	var orderArray = Array();
	var restoreArray = Array();
	
	// what if we store the token to a local variable? - this doesn't matter it is something else
	// after the products gets kicked out all product requests fail. 
	
	var checkSession = MickmanAppLogin.Session.getInstance().get();
	var myToken = checkSession.sessionId;
	var myID = checkSession.userId;
	console.log(myID);
	
	//product.getItem('token').then(function(err,value){ //maybe it is this line?
	//I think eliminating this line has fixed some issues??
		token = myToken;
		orderdb.iterate(function(value, key, iterationNumber) {//now lets iterate through the orders
			if(value[3] == 0){ //find the orders that aren't synced yet
				orderArray.push([key,value]);
				restoreArray.push([value[0],value[1],value[2],value[3],value[4]]); //added 4 for delivered
			}
			//first lets try connecting using the token - 
			$.mobile.loading("show");  // Show loading graphic
			
		}).then(function(result){ //now we will send all that stuff to the db 
			console.log("# to send for update: " + orderArray.length);
			if(orderArray.length > 0){
				$.ajax({
			        type: 'POST',
			        url: MickmanAppLogin.Settings.syncDataUrl,
			        data: "token=" + token + "&id="+ myID +"&data=" + JSON.stringify(orderArray) + "&sync-data=true",
			        success: function (resp) {
				        //console.log("Debug:" + resp);
				        console.log("Debug: " + JSON.stringify(resp, null, 4));
				        
				        if(resp.success == true){//now lets mark the columns that we saved.
					        markedOrder = String(resp.extras.marksaved);//we need to mark the returned as a string 
					        syncedArray = markedOrder.split(",");//to create an array
					        savedOrders = resp.extras.data;
					        syncedItems = orderArray.length;
					        var key = [];
					        
					        for(x=0;x<savedOrders.length;x++){
								savedOrders[x][1][3] = 1;//switch the number to done
								key.push(savedOrders[x]);
							}
					        
							var promises = key.map(function(item) { 
								//return order.setItem(item[0],item[1]); 
								return orderdb.setItem(item[0],item[1]);
							});
							
							console.log(key);
							console.log("--");
							Promise.all(promises).then(function(results) {
								console.log(results);
								app.orderController.buildOrders();//refresh the Orders
							});
				        }else{
					        //console.log("not saved");
					        //console.log(resp);
					        $(".print-message").removeClass('bi-invisible');
							$(".print-message").addClass("bi-ctn-err");
							$(".print-message").html("Sync Error: " + JSON.stringify(resp, null, 4));
				        }
				        $.mobile.loading("hide");
				        $(".syncOrders").removeClass('ui-state-disabled');
					},
					error: function(e){
						//console.log(e);
						$.mobile.loading("hide");
						console.log("Debug: error" + JSON.stringify(e, null, 4));
						$(".print-message").removeClass('bi-invisible');
						$(".print-message").addClass("bi-ctn-err");
						$(".print-message").html("Error syncing.");
						$(".syncOrders").removeClass('ui-state-disabled');
					}
				});
			}else{
				console.log("these orders appear to have been synced.");
				$.mobile.loading("hide");
				$(".print-message").removeClass('bi-invisible');
				$(".print-message").addClass("bi-ctn-err");
				$(".print-message").html("These orders appear to have been synced.");
				$(".syncOrders").removeClass('ui-state-disabled');
			}
		}).catch(function(err) {
			console.log("Debug: internal db not found");
			$.mobile.loading("hide");
		});
});
//print page
$(document).on('click', '.printOrders', function(){//first lets organize the content of the orders
	var gtotal = 0;
	var orderContent = '';
	if(isprintAvailable == true){
		orderdb.iterate(function(value, key, iterationNumber) { //lets put together the content 
	
			var name = value[0][1] + " " + value[0][2];
			var address = value[0][3];
			var citystatezip = value[0][4] + " " +  value[0][5] + " ," + value[0][6];
			var phone = value[0][7];
			var email = value[0][8];
			var getdate = key;
			var date = getdate.split("-");
			var day = new Date(+date[1]).getUTCDate();
			var month = new Date(+date[1]).getUTCMonth();
			var year = new Date(+date[1]).getUTCFullYear();
			var subtotal = 0;
			
			
			//build the client info
			orderContent += '<table>';
			orderContent += '<thead><tr><th>Name</th><th>Address</th><th>Phone</th><th>Email</th></tr></thead>';
			orderContent += '<tbody><tr><td>'+name+'</td>';
			orderContent += '<td>'+address+" "+citystatezip+'</td>';
			orderContent += '<td>'+phone+'</td>';
			orderContent += '<td>'+email+'</td>';
			orderContent += '</tr></tbody></table>';
			
			orderContent += '<table><thead><tr><th>Product</th><th>Number</th><th>Cost</th></tr></thead><tbody>';
			for(x=0;x<value[1].length;x++){
				orderContent += '<tr><td>'+value[1][x][0]+'</td><td>'+value[1][x][1][1]+'</td><td>'+value[1][x][1][0]+'</td></tr>';
				subtotal += Number(value[1][x][1][1])*Number(value[1][x][1][0]);
			}
			gtotal += Number(subtotal);
			orderContent += '</tbody></table>';
			orderContent += '<p><strong>Order subtotal: </strong>'+format1(Number(subtotal),"$")+'</p>';
			orderContent += '<p><strong>Payment Status: </strong>'+value[2]+'</p>';
			
		}).then(function(){
			orderContent += "<p><strong>Grand Total </strong>"+format1(gtotal,"$")+"</p>";
			
			$(".print-message").removeClass('bi-invisible');
			$(".print-message").html('Sending to printer');
			
			var page = '<title>Order Summary</title><style type="text/css">body{font-family:"\'Arial\',Helvetica,sans-serif;"}table{border:1px solid #000;width:100%;}td{border:1px solid #CCC;padding:10px;}</style><body>'+orderContent+'</body>'; //printed page
			
			window.plugin.printer.print(page, { name: 'Order Inventory', duplex: 'short' }, function(done){ //Print Function!!!!!
				if(done == done){
					$(".print-message").html('Orders printing').delay(800).fadeOut().delay(800).addClass('bi-invisible');
				}else{
					$(".print-message").html('Printing Cancelled').delay(800).fadeOut().delay(800).addClass('bi-invisible');
				}
			});
		});
	}else{
		$(".print-message").removeClass('bi-invisible');
		$(".print-message").addClass("bi-ctn-err");
		$(".print-message").html("Sorry Airprint is not currently available.");
	}
});