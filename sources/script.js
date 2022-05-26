'use strict';

import {
    productFeed
} from "./feed.js";

(function (self) {
    let languageStorage = window.localStorage.getItem('language');
    let currency = '';
    let language = '';

    self.init = () => {
        self.reset();
        self.createItemHtml();
        self.stars();
        self.reload();
        self.checkAdded();
        self.addToBasket();
        self.updateMiniCart();
    };

    self.reset = () => {
        if ((languageStorage === 'Turkish' || languageStorage === null)) {
            currency = 'TRY';
            language = 'Turkish';
        } else {
            currency = 'USD';
            language = 'English';
        }

        $('input[value=' + language + ']').attr('checked', true);
    };

    self.createItemHtml = () => {
        let itemMainHtml = '';
        let stockText = language === 'Turkish' ? 'Son {product_stock} ürün' : 'Last {product_stock} product(s)';
        let cartText = language === 'Turkish' ? ' Sepete Ekle' : ' Add to Cart'
        let itemHtmlWrapper =
            '<li class="product-wrapper">' +
            '    <div class="inner-box">' +
            '        <a href="{product_url}" class="product-image-container">' +
            '           <img class="product-image" width="90%" height="100%" src="{image_source}">' +
            '        </a>' +
            '       <div class="product-info">' +
            '        <div class="product-name" contenteditable="false">' +
            '           <a>' +
            '               {product_name}' +
            '           </a>' +
            '        </div>' +
            '        <span class="product-reviews">' +
            '           <a href = "#" class = "product-rating" >' +
            '           </a>' +
            '           <span class="review-count">({review_count})</span>' +
            '           <span class="star-rating">{star}</span>' +
            '        </span>' +
            '           <div class="product-info">' +
            '               <div class="product-price">{product_price}</div>' +
            '               <div class="product-discount {hide_class}">{product_discount}</div>' +
            '               <div class="product-stock {last-10}">' + stockText + '</div>' +
            '           </div>' +
            '           <div class="product-buttons">' +
            '               <button product-id="{product_id}" class="add-to-cart"><i class="fas fa-shopping-cart">' + cartText + '</i></div>' +
            '           </div>' +
            '        </div>' +
            '    </div>' +
            '</li>';

        productFeed.forEach(function (product) {
            var itemHtml = itemHtmlWrapper;
            let currencySymbol = currency === 'TRY' ? '₺' : '$';

            if (product.price[currency] === product.original_price[currency]) {
                itemHtml = itemHtml.replace('{hide_class}', 'no-display');
            }

            if (product.product_attributes.star_rating === 0) {
                itemHtml = itemHtml.replace('star-rating', 'no-display');
                itemHtml = itemHtml.replace('review-count', 'no-display');
            }

            if (product.stock <= 10) {
                itemHtml = itemHtml.replace('{last-10}', 'last-10-product');
            }

            itemMainHtml += itemHtml
                .replace('{image_source}', product.img)
                .replace('{product_name}', product.name)
                .replace('{product_stock}', product.stock)
                .replace('{product_id}', product.id)
                .replace('{product_price}', product.price[currency].toFixed(2) + currencySymbol)
                .replace('{star}', product.product_attributes.star_rating || 0)
                .replace('{review_count}', product.product_attributes.review_count || 0)
                .replace('{product_discount}', product.original_price[currency].toFixed(2) + currencySymbol)
                .replace('{item_link}', product.url);

            $('ul').append(itemMainHtml);
            itemMainHtml = '';
        });
    };

    self.stars = () => {
        const starsHtml = {
            full: '<i class="fas fa-star"></i>',
            half: '<i class="fas fa-star-half-alt"></i>',
            empty: '<i class="far fa-star"></i>'
        };

        $('.star-rating').get().forEach((star) => {
            let starNumbers = {
                starRate: 0,
                fullNumber: 0,
                halfNumber: 0,
                emptyNumber: 0,
            }

            starNumbers.starRate = Number(star.innerText, star);
            starNumbers.fullNumber = Number(starNumbers.starRate.toFixed(1).split('.')[0]);
            starNumbers.halfNumber = Number(starNumbers.starRate.toFixed(1).split('.')[1]) >= 5 ? 1 : 0;

            if (starNumbers.fullNumber === 5 || starNumbers.fullNumber === 4 && starNumbers.halfNumber >= 5) {
                starNumbers.emptyNumber = 0;
            } else {
                starNumbers.emptyNumber = 5 - (starNumbers.fullNumber + starNumbers.halfNumber);
            }

            star.innerText = '';

            for (let i = 0; i < starNumbers.fullNumber; i++) {
                $(star).append(starsHtml.full)
            }

            starNumbers.halfNumber >= 1 ? $(star).append(starsHtml.half) : '';

            for (let i = 0; i < starNumbers.emptyNumber; i++) {
                $(star).append(starsHtml.empty)
            }
        });
    }

    self.reload = () => {
        $('.language').click(function () {
            if (this.value === language) {
                return;
            } else {
                let newLang = language === 'Turkish' ? 'English' : 'Turkish';
                window.localStorage.setItem('language', newLang);
                window.location.reload();
            }
        });
    };

    self.checkAdded = () => {
        let productId = '';
        let addedText = language === 'Turkish' ? ' Sepete Eklendi' : ' Added to Cart';
        let getCartItems = window.localStorage.getItem('cart-items');

        if (getCartItems) {
            $('.add-to-cart').get().forEach((product) => {
                productId = $(product).attr('product-id');

                if (window.localStorage.getItem('cart-items').includes(productId)) {
                    $(product).addClass('added');
                    $(product.children).text(addedText);
                }
            });
        }
    };

    self.addToBasket = () => {
        let addedText = language === 'Turkish' ? ' Sepete Eklendi' : ' Added to Cart';
        let removedText = language === 'Turkish' ? 'Sepete Ekle' : 'Add to Cart';
        let basketProductArray = [];

        $('.add-to-cart').click(function () {
            let addedProductsId = $(this).attr('product-id');
            let getCartItems = window.localStorage.getItem('cart-items');

            if (getCartItems === null) {
                window.localStorage.setItem('cart-items', '');
                getCartItems = '';
            }

            if (getCartItems !== null) {
                basketProductArray = getCartItems.split(',');
            }

            if (getCartItems.includes(',' + addedProductsId)) {
                $(this).removeClass('added');
                $(this.children).text(removedText);
                let removedItem = '';

                removedItem = getCartItems.replace(',' + addedProductsId, '');

                removedItem.split(',');
                window.localStorage.setItem('cart-items', removedItem);
                self.updateMiniCart();

                return;
            } else if (basketProductArray.includes(addedProductsId)) {
                $(this).removeClass('added');
                $(this.children).text(removedText);
                let removedItem = '';

                removedItem = getCartItems.replace(addedProductsId, '');

                removedItem.split(',');
                window.localStorage.setItem('cart-items', removedItem);
                self.updateMiniCart();

                return;
            }

            getCartItems === '' ? getCartItems += addedProductsId : getCartItems += ',' + addedProductsId;

            $(this.children).text(addedText);
            $(this).addClass('added');
            self.triggerModal(addedProductsId);

            window.localStorage.setItem('cart-items', getCartItems);
            self.updateMiniCart();
        });
    }

    self.triggerModal = (productId) => {
        const modal = $('.added-cart-modal')[0];
        const closeModal = $('.modal-close')[0];
        let productIndex = productFeed.findIndex(product => product.id === productId);

        self.createInnerModal(productIndex);

        modal.style.display = "flex";

        closeModal.onclick = function () {
            modal.style.display = "none";
            $('.product-wrapper','.modal-content').remove();
        };

        window.onclick = function (event) {
            if (event.target === modal) {
                modal.style.display = "none";
                $('.product-wrapper','.modal-content').remove();
            }
        }
    };

    self.createInnerModal = (productIndex) => {
        let product = productFeed[productIndex];
        let itemMainHtml = '';
        let stockText = language === 'Turkish' ? 'Son {product_stock} ürün' : 'Last {product_stock} product(s)';
        let addedText = language === 'Turkish' ? 'Sepete Eklendi' : 'Added to Cart';
        let itemHtmlWrapper =
            '<li class="product-wrapper modal-wrapper">' +
            '    <div class="inner-box">' +
            '               <div class="cart-text">'+ addedText +'</div>' +
            '        <a href="{product_url}" class="product-image-container">' +
            '           <img class="product-image" width="90%" height="100%" src="{image_source}">' +
            '        </a>' +
            '       <div class="product-info">' +
            '        <div class="product-name" contenteditable="false">' +
            '           <a>' +
            '               {product_name}' +
            '           </a>' +
            '        </div>' +
            '        <span class="product-reviews">' +
            '           <a href = "#" class = "product-rating" >' +
            '           </a>' +
            '           <span class="review-count"></span>' +
            '           <span class="star-rating"></span>' +
            '        </span>' +
            '           <div class="product-info">' +
            '               <div class="product-price">{product_price}</div>' +
            '               <div class="product-discount {hide_class}">{product_discount}</div>' +
            '               <div class="product-stock {last-10}">' + stockText + '</div>' +
            '           </div>' +
            '        </div>' +
            '    </div>' +
            '</li>';

        var itemHtml = itemHtmlWrapper;
        let currencySymbol = currency === 'TRY' ? '₺' : '$';

        if (product.price[currency] === product.original_price[currency]) {
            itemHtml = itemHtml.replace('{hide_class}', 'no-display');
        }

        if (product.product_attributes.star_rating === 0) {
            itemHtml = itemHtml.replace('star-rating', 'no-display');
            itemHtml = itemHtml.replace('review-count', 'no-display');
        }

        if (product.stock <= 10) {
            itemHtml = itemHtml.replace('{last-10}', 'last-10-product');
        }

        itemMainHtml += itemHtml
            .replace('{image_source}', product.img)
            .replace('{product_name}', product.name)
            .replace('{product_stock}', product.stock)
            .replace('{product_id}', product.id)
            .replace('{product_price}', product.price[currency].toFixed(2) + currencySymbol)
            .replace('{product_discount}', product.original_price[currency].toFixed(2) + currencySymbol)
            .replace('{item_link}', product.url);

        $('.modal-content').append(itemMainHtml);
        itemMainHtml = '';
    };

    self.updateMiniCart = () => {
        let numberOfCart = JSON.stringify(window.localStorage.getItem('cart-items').split(',').length || 0);

        if (window.localStorage.getItem('cart-items') === '') {
            numberOfCart = '0';
        }

        let numberSelector = $('div.number');
        let parentOfNumber = $('div.basket-count');

        if (numberOfCart === '0') {
            parentOfNumber.css('display', 'none');
            return;

        } else {
            parentOfNumber.css('display', 'flex');
        }

        numberSelector.text(numberOfCart);
    };

    self.init();
})({});