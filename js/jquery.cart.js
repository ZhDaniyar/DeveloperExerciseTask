let cart = JSON.parse(localStorage.getItem("cart")) || [];

function formatterCart(priceSum) {
    return new Intl.NumberFormat('ru-RU').format(priceSum) + ' ₸';
}

function updateCartBadge() {
    let cartBadge = document.querySelector('.open_cart_number');
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
}

function displayCart() {
    const existingCart = document.querySelector(".jqcart_layout");
    if (existingCart) existingCart.remove();

    const cartHTML = document.createElement('div');
    cartHTML.classList.add('jqcart_layout');

    let cartItemsHTML = cart.map(item => `
        <ul class="jqcart_tbody" data-id="${item.code}">
            <li class="jqcart_small_td">
                <img src="${item.img}" alt="Img">
            </li>
            <li>
                <div class="jqcart_nd">
                    <a href="${item.link}">${item.title}</a>
                </div>
            </li>
            <li></li>
            <li class="jqcart_price">${formatterCart(item.price)}</li>
            <li>
                <div class="jqcart_pm">
                    <input type="text" class="jqcart_amount" value="${item.quantity}" data-code="${item.code}">
                    <span class="jqcart_incr" data-incr="1" data-code="${item.code}">
                        <i class="fa fa-angle-up" aria-hidden="true"></i>
                    </span>
                    <span class="jqcart_incr" data-incr="-1" data-code="${item.code}">
                        <i class="fa fa-angle-down" aria-hidden="true"></i>
                    </span>
                </div>
            </li>
            <li class="jqcart_sum">${formatterCart(item.price * item.quantity)}</li>
        </ul>
    `).join('');

    let totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    cartHTML.innerHTML = `
        <div class="jqcart_content">
            <div class="jqcart_table_wrapper">
                <div class="jqcart_manage_order">
                    <ul class="jqcart_thead">
                        <li></li>
                        <li>ТОВАР</li>
                        <li></li>
                        <li>ЦЕНА</li>
                        <li>КОЛИЧЕСТВО</li>
                        <li>СТОИМОСТЬ</li>
                    </ul>
                    ${cartItemsHTML}
                </div>
            </div>
            <div class="jqcart_manage_block">
                <div class="jqcart_btn">
                    <button class="jqcart_open_form_btn">Оформить заказ</button>
                    <form class="jqcart_order_form" style="opacity: 0">
                        <input class="jqcart_return_btn" type="reset" value="Продолжить покупки">
                    </form>
                </div>
                <div class="jqcart_subtotal">Итого: <strong>${formatterCart(totalAmount)}</strong></div>
            </div>
        </div>
    `;

    document.body.appendChild(cartHTML);

    cartHTML.addEventListener('click', function (event) {
        if (event.target.classList.contains('jqcart_layout')) {
            cartHTML.remove();
        }
    });

    attachQuantityChangeListeners();
}

function updateCart() {
    let cartItems = document.querySelectorAll(".jqcart_tbody");

    cartItems.forEach(row => {
        let code = row.getAttribute("data-id");
        let item = cart.find(p => p.code === code);

        if (item) {
            row.querySelector(".jqcart_amount").value = item.quantity;
            row.querySelector(".jqcart_sum").textContent = formatterCart(item.price * item.quantity);
        } else {
            row.remove();
        }
    });

    let totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let totalElement = document.querySelector(".jqcart_subtotal strong");
    if (totalElement) {
        totalElement.textContent = formatterCart(totalAmount);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();
}

function attachQuantityChangeListeners() {
    document.querySelectorAll('.jqcart_incr').forEach(button => {
        button.addEventListener('click', function () {
            let code = this.getAttribute('data-code');
            let incr = parseInt(this.getAttribute('data-incr'));

            let item = cart.find(p => p.code === code);
            if (item) {
                item.quantity += incr;

                if (item.quantity <= 0) {
                    cart = cart.filter(p => p.code !== code);
                }

                localStorage.setItem("cart", JSON.stringify(cart));
                updateCart();
            }
        });
    });
}

function addToCart(event) {
    let button = event.target;
    let code = button.getAttribute('data-code');

    if (!code || !window.data) return;

    let product = window.data.find(p => p.code === code);

    if (product) {
        let cartItem = cart.find(p => p.code === code);
        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartBadge();
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".product_item_price_btn").forEach(button => {
        button.addEventListener("click", addToCart);
    });

    document.getElementById("open_cart_btn").addEventListener("click", displayCart);
    updateCartBadge();
});

document.addEventListener("click", function (event) {
    if (event.target.classList.contains("add-to-cart-btn")) {
        addToCart(event);
    }
});
