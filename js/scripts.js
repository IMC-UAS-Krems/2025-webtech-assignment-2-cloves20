// items.js


const ITEMS = {
  p1: { name: "The Passion Within", price: 5.42},
  p2: { name: "Mona'nin Gözleri", price: 8.5 },
  p3: { name: "The Sorrows Of Young Werther", price: 12 },
  p4: { name: "The Film Book", price: 10.75 },
  p5: { name: "Gurur Ve Önyargi", price: 9 },
  p6: { name: "Sharp Force", price: 6.54},
  p7: { name: "Hope's End", price: 10.87 },
  p8: { name: "The Secrets Of Secrets", price: 12},
  p9: { name: "The Polaroid Book", price: 7},
  p10: { name: "Where are You?", price: 11.32 },
  p11: { name: "Older book collection", price: 0},
  p12: { name: "The Passion Within", price: 4.6},
  p13: { name: "Your Soul Is A River", price: 10.11 },
  p14: { name: "General Music", price: 6.90 },
  p15: { name: "All Alice Munro Collection", price: 14.56 },
  p16: { name: "Bush Craft 101", price: 13.20 },

};


// cart.js


var cart = {}; 

// taxes and discounts
var TAX = 0.03;
var DISCOUNT_RATE = 0.10;
var DISCOUNT_MIN_ITEMS = 3;

// helper to scroll to a section 
function goTo(id) {
  var el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// attach clear button once
var clearBtn = document.getElementById("clearCartBtn");
if (clearBtn) {
  clearBtn.addEventListener("click", function(){
    cart = {};
    updateCart();
    // scroll to top of page 
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Hook add buttons 
var addBtns = document.querySelectorAll(".add-to-cart-btn");
addBtns.forEach(function(b){
  b.addEventListener("click", function(){
    var id = b.dataset.id;
    if (!id) return; 

    if (!cart[id]) {
      cart[id] = 1;
    } else {
      cart[id] = cart[id] + 1;
    }

    console.log("added", id, "cart now:", cart);

    updateCart(); 

    //Bootstrap open cart 
    var c = new bootstrap.Collapse(document.getElementById("cartCollapse"), { toggle: false });
    c.show();

  
    setTimeout(function(){
      goTo("cartCollapse");
    }, 120);
  });
});

// Update cart 
function updateCart(){
  var container = document.getElementById("cartItemsContainer");
  var badge = document.getElementById("cartCountBadge");
  var summary = document.getElementById("cartSummary");

  // reset
  container.innerHTML = "";

  var totalItems = 0;
  for (var id in cart) {
    totalItems += cart[id];

    var item = ITEMS[id];
    if (!item) continue;

    var row = document.createElement("div");
    row.className = "list-group-item d-flex justify-content-between align-items-center";

    // building html string 
    row.innerHTML = ''
      + '<div><strong>' + item.name + '</strong><div class="text-muted small">$' + item.price.toFixed(2) + ' each</div></div>'
      + '<div>'
      + '  <input type="number" class="form-control form-control-sm qty" data-id="' + id + '" value="' + cart[id] + '" min="1" style="width:80px; display:inline-block; margin-right:6px;">'
      + '  <button id="remove" class="btn btn-sm btn-outline-danger remove-item" data-id="' + id + '">Remove</button>'
      + '</div>';

    container.appendChild(row);
  }

  // remove buttons
var rems = document.querySelectorAll("#remove");
rems.forEach(function(btn){
    btn.addEventListener("click", function(){
        var id = btn.dataset.id;
        delete cart[id];
        updateCart();
    });
});


  badge.textContent = totalItems;

  // if empty
  if (totalItems === 0) {
    container.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
    summary.innerHTML = '';
    return;
  }

  // listeners for qty
  var qInputs = document.querySelectorAll(".qty");
  qInputs.forEach(function(inp){
    // remove previous listeners 
    var newInp = inp.cloneNode(true);
    inp.parentNode.replaceChild(newInp, inp);
    newInp.addEventListener("change", function(){
      var id = newInp.dataset.id;
      var v = parseInt(newInp.value, 10);
      if (isNaN(v) || v < 1) v = 1;
      cart[id] = v;
      updateCart();
    });
  });

  
  


}

// totals 
function updateTotals(){
  var subtotal = 0;
  var itemCount = 0;
  for (var id in cart) {
    if (!ITEMS[id]) continue;
    subtotal += ITEMS[id].price * cart[id];
    itemCount += cart[id];
  }

  var discount = 0;
  if (itemCount >= DISCOUNT_MIN_ITEMS) {
    discount = subtotal * DISCOUNT_RATE;
  }

  var tax = (subtotal - discount) * TAX;
  var total = subtotal - discount + tax;

  // display 
  var summary = document.getElementById("cartSummary");
  summary.innerHTML = ''
    + '<div class="summary-row"><div>Subtotal</div><div>$' + subtotal.toFixed(2) + '</div></div>'
    + '<div class="summary-row"><div>Discount</div><div>$' + discount.toFixed(2) + '</div></div>'
    + '<div class="summary-row"><div>Tax</div><div>$' + tax.toFixed(2) + '</div></div>'
    + '<hr>'
    + '<div class="summary-row"><div><strong>Total</strong></div><div><strong>$' + total.toFixed(2) + '</strong></div></div>';
}

// checkout.js


var checkoutBtn = document.getElementById("checkoutBtn");
var checkoutShowBtn = document.getElementById("checkoutShowBtn");

if (checkoutBtn) checkoutBtn.addEventListener("click", openCheckout);
if (checkoutShowBtn) checkoutShowBtn.addEventListener("click", openCheckout);


function openCheckout(){
  if (!cart || Object.keys(cart).length === 0) {
    alert("Cart is empty.");
    return;
  }

  populatePreview();

  var cb = new bootstrap.Collapse(document.getElementById("checkoutCollapse"), { toggle: false });
  cb.show();

  //scroll
  setTimeout(function(){
    goTo("checkoutCollapse");
  }, 120);

  // hide cart 
  var cc = bootstrap.Collapse.getInstance(document.getElementById("cartCollapse"));
  if (cc) cc.hide();
}

function populatePreview(){
  var preview = document.getElementById("orderPreview");
  var subtotal = 0;
  var qty = 0;
  var html = '<ul>';

  for (var id in cart) {
    if (!ITEMS[id]) continue;
    html += '<li>' + ITEMS[id].name + ' x ' + cart[id] + '</li>';
    subtotal += ITEMS[id].price * cart[id];
    qty += cart[id];
  }
  html += '</ul>';

  var discount = 0;
  if (qty >= 3) discount = subtotal * 0.10;

  var tax = (subtotal - discount) * 0.05;
  var total = subtotal - discount + tax;

  html += '<p>Subtotal: $' + subtotal.toFixed(2) + '</p>';
  html += '<p>Discount: $' + discount.toFixed(2) + '</p>';
  html += '<p>Tax: $' + tax.toFixed(2) + '</p>';
  html += '<h5>Total: $' + total.toFixed(2) + '</h5>';

  preview.innerHTML = html;
}


// form submit
var form = document.getElementById("checkoutForm");
if (form) {
  form.addEventListener("submit", function(e){
    e.preventDefault();
    if (!this.reportValidity()) return;

    var customer = {
      first: this.firstName.value,
      last: this.lastName.value,
      address: this.address.value,
      city: this.city.value,
      zip: this.zip.value,
      phone: this.phone.value,
      email: this.email.value
    };

    showConfirmation(customer);
  });
}

function showConfirmation(customer){
  var box = document.getElementById("confirmationDetails");
  var html = '<h5>Buyer</h5>';
  html += '<p><strong>' + customer.first + ' ' + customer.last + '</strong><br>';
  html += customer.address + ', ' + customer.city + ' ' + customer.zip + '</p>';

  html += '<h5>Order</h5><ul>';
  for (var id in cart) {
    if (!ITEMS[id]) continue;
    html += '<li>' + ITEMS[id].name + ' x ' + cart[id] + '</li>';
  }
  html += '</ul>';

  // totals
  var subtotal = 0;
  var qty = 0;
  for (var id in cart) {
    if (!ITEMS[id]) continue;
    subtotal += ITEMS[id].price * cart[id];
    qty += cart[id];
  }
  var discount = (qty >= 3) ? subtotal * 0.10 : 0;
  var tax = (subtotal - discount) * 0.05;
  var total = subtotal - discount + tax;

  html += '<div class="summary-row"><div>Subtotal</div><div>$' + subtotal.toFixed(2) + '</div></div>';
  html += '<div class="summary-row"><div>Discount</div><div>$' + discount.toFixed(2) + '</div></div>';
  html += '<div class="summary-row"><div>Tax</div><div>$' + tax.toFixed(2) + '</div></div>';
  html += '<hr><div class="summary-row"><div><strong>Total Paid</strong></div><div><strong>$' + total.toFixed(2) + '</strong></div></div>';

  box.innerHTML = html;

  //scroll to panel
  var panel = document.getElementById("confirmationPanel");
  if (panel) panel.classList.remove("d-none");

  setTimeout(function(){
    goTo("confirmationPanel");
  }, 120);

  // clear cart 
  cart = {};
  updateCart();

  // hide checkout 
  var cb = bootstrap.Collapse.getInstance(document.getElementById("checkoutCollapse"));
  if (cb) cb.hide();
}

// make another donation
var newOrderBtn = document.getElementById("newOrderBtn");
if (newOrderBtn) {
  newOrderBtn.addEventListener("click", function(){
    // hide confirmation
    var panel = document.getElementById("confirmationPanel");
    if (panel) panel.classList.add("d-none");

    // reset form 
    var f = document.getElementById("checkoutForm");
    if (f) f.reset();
    var preview = document.getElementById("orderPreview");
    if (preview) preview.innerHTML = "";

    // reset cart
    cart = {};
    updateCart();

    // scroll to gallery
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

var backBtn = document.getElementById("backToCartBtn");

if (backBtn) {
    backBtn.addEventListener("click", function () {

        // hide checkout section
        var cb = bootstrap.Collapse.getInstance(
            document.getElementById("checkoutCollapse")
        );
        if (cb) cb.hide();

        // show cart
        var cart = new bootstrap.Collapse(
            document.getElementById("cartCollapse"),
            { toggle: false }
        );
        cart.show();

        // scroll to cart
        setTimeout(function () {
            goTo("cartCollapse");
        }, 120);
    });
}
