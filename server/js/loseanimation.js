
    var settings = {
        rainbowLength: 64,
        rainbowMultiplier: 2,
        rainbowClass: 'rainbow-text',
        delay: 24, //not using it cuz rAF
        repeat: true,
        numberAches: {
            topWeeoo: function (tI, k) {
                return Math.sin((tI + k) / 6) * 20 + 'px';
            },
            leftWeeoo: function (tI, k) {
                return Math.cos((tI + k) / 6) * 15 + 'px';
            },
            spacingWeeoo: function (tI, k) {
                return Math.sin((tI + k) / 15) * 6 + 'px';
            },
            sizeWeeoo: function (tI, k) {
                return ((Math.sin(((tI / 2) + k) / 10) * 16) + 72) + 'px';
            },
            opacityWeeoo: function (tI, k) {
                return Math.cos(tI + k) / 8 + .8125;
            }
        }
    };
    
    var RainbowObj = {
        rainbow: makeMeARainbow(settings.rainbowLength),
        init: function (word) {
            var sourceElement = document.querySelector('.' + settings.rainbowClass);
            
            this.element = this.dissectText(sourceElement, word);
            sourceElement.parentNode.insertBefore(this.element, sourceElement);
            sourceElement.remove();
            
            this.update(this.draw(this.element));
            
            return this;
        },
        draw: function (el) {
            if (!el) return;
            var _self = this;
            
            var spans = el.querySelectorAll('span');
            [].forEach.call(spans, function (v, k) {
                v.style.color = _self.rainbow[k % _self.rainbow.length];
                v.style.position = 'relative';
            });
            
            return spans;
        },
        dissectText: function (sourceEl,word) {
        //var textSource = sourceEl.textContent,
        var textSource = word;
                headingContainer = document.createElement('h1');
            
            textSource.split('').forEach(function (v, k, c) {
                var span = document.createElement('span'),
                    destText = document.createTextNode(v);
                
                span.appendChild(destText);
                headingContainer.appendChild(span);
            });
            
            headingContainer.className = settings.rainbowClass;
            
            return headingContainer;
        },
        update: function (spans) {
            if (!spans) return;
            var _self = this,
                delay = settings.delay,
                nanana = settings.numberAches,
                tI = _self.totalIterations = 0;
            
            //_self.updater && window.clearTimeout(_self.updater);
            //_self.updater = window.setTimeout(animateText.bind(_self, spans), delay);
            requestAnimationFrame(animateText.bind(_self, spans, tI));
            
            function animateText(spans, tI) {
                [].forEach.call(spans, function (v, k) {
                    v.style.color = _self.rainbow[(tI + k) % _self.rainbow.length];
                    v.style.top = nanana.topWeeoo(tI, k); //Math.sin((tI + k) / 6) * 20 + 'px';
                    v.style.left = nanana.leftWeeoo(tI, k); //Math.cos((tI + k) / 6) * 15 + 'px';
                    v.style.letterSpacing = nanana.spacingWeeoo(tI, k); //Math.sin((tI + k) / 15) * 10 + 'px';
                    v.style.fontSize = nanana.sizeWeeoo(tI, k); //((Math.sin( ((tI/2) + k)/10 )*16) + 72 ) + 'px';
                    v.style.opacity = nanana.opacityWeeoo(tI, k); //Math.cos(tI + k)/8 + .8125;
                });
                
                if (settings.repeat) requestAnimationFrame(animateText.bind(_self, spans, ++tI));
                //if (settings.repeat) _self.updater = window.setTimeout(animateText.bind(_self, spans), delay);
            };
            
            return _self;
            //return _self.updater;
        }
    };
    
    function makeMeARainbow(length) {
        var length = length || 64;
        
        return (function generateRainbow(arr, amount) {
            if (--amount < 0) return arr;
            arr.push(generateColor(((length - amount + 1) % length), length, settings.rainbowMultiplier));
            return generateRainbow(arr, amount);
        })([], length);
        
        function generateColor(amount, total, multiplier) {
            return 'hsla\(' + ((amount * multiplier) * (360 / total)) + ',100%,60%,0.90\)'
        }
    }


    
    // UTILS
    function extend(target) {
        Array.prototype.slice.call(arguments, 1).forEach(function (source) {
            Object.getOwnPropertyNames(source).forEach(function (name) {
                target[name] = source[name]
            })
        })
        return target
    }
