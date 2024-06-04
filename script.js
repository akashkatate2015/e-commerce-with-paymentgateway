document.addEventListener('DOMContentLoaded', function() {
    var addToCartButtons = document.querySelectorAll('.add-to-cart');
    var modal = document.getElementById('modal');
    var cartModal = document.getElementById('cart-modal');
    var closeButton = document.querySelector('.close-button');
    var closeCartButton = document.querySelector('.close-cart-button');
    var userForm = document.getElementById('userForm');
    var myCartButton = document.getElementById('my-cart');
    var checkoutButton = document.getElementById('checkout');
    var cartCount = document.getElementById('cart-count');
    var cartDetailsDiv = document.getElementById('cart-details');
    var cart = [];

    function updateCartCount() {
        cartCount.textContent = cart.length;
    }

    function displayCartDetails() {
        cartDetailsDiv.innerHTML = '';
        var totalAmount = 0;
        cart.forEach(function(item) {
            var cartItemDiv = document.createElement('div');
            cartItemDiv.textContent = item.product + ' - ₹' + item.price + ' x ' + item.quantity;
            cartDetailsDiv.appendChild(cartItemDiv);
            totalAmount += item.price * item.quantity;
        });
        var totalAmountDiv = document.createElement('div');
        totalAmountDiv.innerHTML = '<strong>Total: ₹' + totalAmount + '</strong>';
        cartDetailsDiv.appendChild(totalAmountDiv);
    }

    addToCartButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var product = this.getAttribute('data-product');
            var price = parseFloat(this.getAttribute('data-price'));
            var existingProduct = cart.find(item => item.product === product);
            if (existingProduct) {
                existingProduct.quantity++;
            } else {
                cart.push({ product: product, price: price, quantity: 1 });
            }
            alert(product + ' added to cart');
            updateCartCount();
        });
    });

    myCartButton.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }
        displayCartDetails();
        cartModal.style.display = 'block';
    });

    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    closeCartButton.addEventListener('click', function() {
        cartModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
        if (event.target == cartModal) {
            cartModal.style.display = 'none';
        }
    });

    checkoutButton.addEventListener('click', function() {
        cartModal.style.display = 'none';
        modal.style.display = 'block';
    });

    userForm.addEventListener('submit', function(event) {
        event.preventDefault();
        var name = document.getElementById('name').value;
        var phone = document.getElementById('phone').value;
        var address = document.getElementById('address').value;
        var street = document.getElementById('street').value;
        var state = document.getElementById('state').value;
        var zip = document.getElementById('zip').value;
        var totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0) * 100;

        var options = {
            "key": "rzp_test_qvFICfVYtSVxWy", // Replace with your Razorpay Key ID
            "amount": totalAmount,
            "currency": "INR",
            "name": "Dummy Product Store",
            "description": "Total Payment",
            "handler": function (response) {
                var paymentDetails = {
                    name: name,
                    phone: phone,
                    address: address,
                    street: street,
                    state: state,
                    zip: zip,
                    products: cart,
                    total_amount: totalAmount / 100,
                    payment_id: response.razorpay_payment_id,
                    payment_date: moment().format('YYYY-MM-DD HH:mm:ss')
                };
                saveToExcel(paymentDetails);
                alert('Payment Successful! Payment ID: ' + response.razorpay_payment_id);
                cart = []; // Clear the cart after successful payment
                updateCartCount(); // Update cart count
            },
            "prefill": {
                "name": name,
                "contact": phone
            },
            "theme": {
                "color": "#3399cc"
            }
        };

        var rzp1 = new Razorpay(options);
        rzp1.open();
    });

    function saveToExcel(paymentDetails) {
        var data = [];

        // Flatten the data for each product purchased
        paymentDetails.products.forEach(product => {
            data.push({
                name: paymentDetails.name,
                phone: paymentDetails.phone,
                address: paymentDetails.address,
                street: paymentDetails.street,
                state: paymentDetails.state,
                zip: paymentDetails.zip,
                product: product.product,
                quantity: product.quantity,
                price: product.price,
                total_amount: paymentDetails.total_amount,
                payment_id: paymentDetails.payment_id,
                payment_date: paymentDetails.payment_date
            });
        });

        var worksheet = XLSX.utils.json_to_sheet(data);
        var workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');
        XLSX.writeFile(workbook, 'payments.xlsx');
    }
});
