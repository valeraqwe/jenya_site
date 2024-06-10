let cart;

document.addEventListener("DOMContentLoaded", function () {
    cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const cartItemsContainer = document.querySelector(".cart-items");
    const cartTotal = document.querySelector("#cart-total");

    function updateCartCounter() {
        let totalItems = 0;
        cart.forEach(product => {
            totalItems += product.quantity;
        });
        const counterElement = document.querySelector("#cartCounter");
        if (counterElement) {
            counterElement.innerText = totalItems;
        }
    }

    function updateTotalPrice() {
        let totalPrice = 0;
        cart.forEach(product => {
            totalPrice += product.price * product.quantity;
        });
        if (cartTotal) {
            cartTotal.innerText = "₴" + totalPrice.toFixed(2);
        } else {
            console.error("Element with id 'cart-total' not found");
        }
    }

    function updateCart() {
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = "";
            const formElement = document.getElementById("orderForm");
            const totalPriceElement = document.querySelector(".total-price");

            if (cart.length === 0) {
                const emptyMessage = document.createElement("div");
                emptyMessage.className = "empty-cart-message";
                emptyMessage.innerHTML = "Немає товарів у кошику";
                cartItemsContainer.appendChild(emptyMessage);

                if (formElement) formElement.style.display = "none";
                if (totalPriceElement) totalPriceElement.style.display = "none";
            } else {
                cart.forEach((product, index) => {
                    const productRow = document.createElement("div");
                    productRow.className = "cart-item";
                    productRow.innerHTML = `
                        <div class="cart-item-detail" data-label="Product"><img src="${product.image}" alt="${product.name}" width="50"></div>
                        <div class="cart-item-detail" data-label="Size">${product.size}</div>
                        <div class="cart-item-detail" data-label="Price">₴${product.price}</div>
                        <div class="cart-item-detail" data-label="Quantity">
                            <div class="quantity-wrapper">
                                <button class="quantity-btn decrease-quantity" data-index="${index}">-</button>
                                <span class="quantity-number">${product.quantity}</span>
                                <button class="quantity-btn increase-quantity" data-index="${index}">+</button>
                            </div>
                        </div>
                        <div class="cart-item-detail" data-label="Remove"><button class="remove-from-cart-btn" data-index="${index}">🗑️</button></div>
                    `;
                    cartItemsContainer.appendChild(productRow);
                });

                if (formElement) formElement.style.display = "flex";
                if (totalPriceElement) totalPriceElement.style.display = "flex";
            }

            updateCartCounter();
            updateTotalPrice();
        } else {
            console.error("Element with class 'cart-items' not found");
        }
    }

    updateCart();

    document.addEventListener("click", function (event) {
        const index = event.target.getAttribute("data-index");
        if (index !== null) {
            if (event.target.classList.contains("remove-from-cart-btn")) {
                cart.splice(index, 1);
            } else if (event.target.classList.contains("increase-quantity")) {
                cart[index].quantity++;
            } else if (event.target.classList.contains("decrease-quantity")) {
                cart[index].quantity = Math.max(1, cart[index].quantity - 1);
            }
            localStorage.setItem("cart", JSON.stringify(cart));
            updateCart();
        }
    });

    function showPopup() {
        const popupElement = document.getElementById("thankYouPopup");
        if (popupElement) {
            popupElement.style.display = "block";
            setTimeout(function () {
                closePopup();
            }, 2000);
        } else {
            console.error("Element with id 'thankYouPopup' not found");
        }
    }

    function closePopup() {
        const popupElement = document.getElementById("thankYouPopup");
        if (popupElement) {
            popupElement.style.display = "none";
        } else {
            console.error("Element with id 'thankYouPopup' not found");
        }
    }

    function clearCart() {
        cart = [];
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCart();
    }

    const orderForm = document.getElementById("orderForm");
    if (orderForm) {
        orderForm.addEventListener("submit", function (event) {
            event.preventDefault();

            let cartInfo = JSON.stringify(cart);
            const cartDataElement = document.getElementById("cartData");
            if (cartDataElement) {
                cartDataElement.value = cartInfo;

                const formData = new FormData(orderForm);

                fetch('process_order.php', {
                    method: 'POST',
                    body: formData,
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.result === true) {
                            clearCart();
                            showPopup();
                            orderForm.reset();
                        } else {
                            alert(`Что-то пошло не так, пожалуйста, попробуйте ещё раз. Error: ${data.error}. Details: ${data.details}`);
                        }
                    })
                    .catch((error) => console.error('Fetch error:', error));
            } else {
                console.error("Element with id 'cartData' not found");
            }
        });
    } else {
        console.error("Element with id 'orderForm' not found");
    }
});
