if (window.localStorage.brandingData) {

    (function () {

        function Page() {
            var self = this;

            this.init = function () {
                this.styleData = JSON.parse(localStorage.brandingData);
                this.rawCss = this.styleData.compiledCSS + this.styleData.advancedCSS + this.dynamicCss;
                this.style = this.writeStyle(this.formatCss(this.rawCss));
                this.headerData = JSON.parse(localStorage.headerData);


                if (document.addEventListener) {
                    document.addEventListener("DOMContentLoaded", function () {
                        self.postInit();
                    });
                } else {
                    document.attachEvent("onreadystatechange", function () {
                        if (document.readyState === "complete") {
                            document.detachEvent("onreadystatechange", arguments.callee);
                            self.postInit();
                        }
                    });
                }

                return this;
            };

            this.postInit = function () {
                self.container = self.renderContainer();
                self.header = self.renderBrandedHeader();
                self.footer = self.renderBrandedFooter();
                self.decorateDom();
                self.grayBox = self.renderGrayBox();
                return self;
            }

            this.handlers = {
                toggleHeaderLinks: function () {
                    self.container.classList.toggle("bPhoneViewLinksVisible");
                    if (self.container.classList.contains("bPhoneViewLinksVisible")) {
                        $(self.container.querySelector(".linkContainer")).trapFocus();
                    } else {
                        $(self.container.querySelector(".linkContainer")).untrapFocus();
                    }
                }
            };

            this.renderContainer = function () {
                var elContainer = document.createElement("div"),
                    nextContainer = document.querySelector("#pageContents") || document.body.firstElementChild;

                nextContainer.parentElement.insertBefore(elContainer, nextContainer);
                elContainer.id = "customHeaderContainer";
                return elContainer;
            };

            this.renderGrayBox = function () {
                var elGrayBox = document.createElement("div");
                this.container.appendChild(elGrayBox);
                elGrayBox.className = "grayBox";
                elGrayBox.setAttribute("role", "presentation");
                return elGrayBox;
            };

            this.renderBrandedHeader = function () {
                this.container.innerHTML = self.container.innerHTML + window.localStorage.header;
                this.addListener(this.container.querySelector(".threeLineIcon"), "click", this.handlers.toggleHeaderLinks);
                this.addListener(this.container.querySelector(".backLink"), "click", this.handlers.toggleHeaderLinks);
                return this.container.firstElementChild;
            }

            this.setHeaderLinks = function () {
                var elHomeLink = document.querySelector("#pbHomeLink, #Home"),
                    sHomeUrl = elHomeLink ? elHomeLink.getAttribute("href") : "";

                localStorage.responsiveLandingPageUrl = localStorage.responsiveLandingPageUrl || document.referrer;

                self.headerLinks = self.container.querySelectorAll(".headerLink");
                self.headerLinks[0].setAttribute("href", sHomeUrl);
                self.headerData.forEach(function (oLink, i) {
                    self.headerLinks[i + 1].setAttribute("href", oLink.Value);
                });
                self.headerLinks[self.headerLinks.length - 2].setAttribute("href", localStorage.responsiveLandingPageUrl + "&fromSM=1");
                self.headerLinks[self.headerLinks.length - 1].style.display = "none";

                return self.headerLinks;
            };

            this.renderBrandedFooter = function () {
                var footer = document.createElement("div");

                footer.className = "footerOuterWrapper";
                footer.innerHTML = window.localStorage.footer;
                document.body.appendChild(footer);
                if (window.$ && $.fn) {
                    self.stackableFooter();
                }
                return footer;
            }

            this.stackableFooter = function () {
                if (!window.$ && $.fn) {
                    return;
                }
                $.fn.on = $.fn.on || $.fn.bind;
                $(window).on("resize", function () {
                    stackFooter();
                }).on("load", function () { stackFooter(); });

                stackFooter();

                function stackFooter() {
                    var $pageFooter = $(".pageFooter");

                    if ($pageFooter) {
                        $pageFooter.removeClass("stackedFooter"); $(".footerLinkContainer").removeClass("stackedFooter");
                        if ($(".footerLinkContainer").height() >= 40)
                        { $pageFooter.addClass("stackedFooter"); $(".footerLinkContainer").addClass("stackedFooter"); }
                        else { $pageFooter.removeClass("stackedFooter"); $(".footerLinkContainer").removeClass("stackedFooter"); }
                    }
                }
            };

            this.decorateButtons = function (container) {
                var buttons, i, coverLetterButtonBar, resumeGrid, editProfileSocialNetorkingButton;

                if (this._elTable) {
                    container = this._elTable;
                }

                buttons = (container || document).querySelectorAll("input[type=button], input[type=submit]");

                for (i = 0; i < buttons.length; ++i) {
                    buttons[i].classList.add("button");
                    buttons[i].classList.remove("REGbutton");
                    if (buttons[i].classList.contains("LRGbutton") || buttons[i].name.indexOf("submit") >= 0 || buttons[i].type == "submit") {
                        buttons[i].classList.remove("LRGbutton");
                        buttons[i].classList.add("primaryButton");
                    }
                }

                if (!container) {
                    self.reorderCvManagerButtons();
                    self.reorderEditProfileButtons();
                    self.hideRedundantSearchAgentButtons(buttons);
                    self.hideRedundantJobCartButtons(buttons);
                }

                return buttons;
            };

            this.hideRedundantJobCartButtons = function (buttons) {
                if (document.body.classList.contains("jobcart")) {
                    buttons[1].style.display = "none";
                    buttons[2].style.marginTop = "10px";
                }
            }

            this.hideRedundantSearchAgentButtons = function (buttons) {
                if (document.body.classList.contains("agentmanager")) {
                    try {
                        buttons[buttons.length - 4].style.display = "none";
                        self.closest(buttons[buttons.length - 4], "table").style.display = "none";
                        buttons[buttons.length - 3].style.display = "none";
                        buttons[buttons.length - 2].style.marginTop = "10px";
                        buttons[buttons.length - 1].style.marginTop = "10px";
                        self.closest(buttons[buttons.length - 4], "table").style.display = "none";
                    } catch (Error) {
                    }
                }
            }

            this.reorderCvManagerButtons = function () {
                var coverLetterButtonBar = document.querySelector("#tblResumeMgr #tblBtnBar1"),
                    buttons, i, resumeGrid;

                if (coverLetterButtonBar) {
                    try {
                        buttons = coverLetterButtonBar.querySelectorAll("input");
                        resumeGrid = document.querySelector("#divResumeGrid");
                        resumeGrid.parentNode.insertBefore(buttons[0], resumeGrid.nextElementSibling);
                        buttons[0].style.marginTop = "20px";
                        buttons[2].style.display = "none";
                    } catch (Error) {

                    }
                }

                return buttons;
            };

            this.reorderEditProfileButtons = function () {
                var isEditProfile = !!document.querySelector("form#frmProfile"),
                    socialButton, h1;

                if (isEditProfile) {
                    socialButton = document.querySelector("#ctl00_MainContent_btnSocialNetworkNonTab");
                    h1 = document.querySelector("h1");
                    if (socialButton && h1) {
                        socialButton.classList.add("socialLink");
                        h1.parentNode.appendChild(socialButton);
                    }
                }

                return socialButton;
            };

            this.decorateGrids = function () {
                var padding = 20,
                    submissionsHeader = document.querySelector("#AttachmentsDiv .EduExpHEADER"),
                    grids;

                if (submissionsHeader) {
                    submissionsHeader.parentElement.parentElement.parentElement.setAttribute("role", "grid");
                }

                function setAllGridWidths() {
                    var grids = document.querySelectorAll("table[role=grid]");

                    for (i = 0; i < grids.length; ++i) {
                        setGridWidth(grids[i]);
                    }
                }

                function setGridWidth(grid) {
                    var w = (window.innerWidth - padding * 4) + "px",
                        isYahoo = !!this._elTable, isYahooLoadingState, i, j, w, containerDiv;

                    if (isYahoo) {
                        grid = this._elTable;
                        isYahooLoadingState = this._elMsgTr && this._elMsgTr.clientWidth;
                        if (isYahooLoadingState) {
                            setTimeout(function () {
                                setGridWidth(grid);
                            }, 100);
                        }
                    } else if (!grid.wrapped) {
                        containerDiv = document.createElement("div");
                        grid.parentElement.insertBefore(containerDiv, grid);
                        containerDiv.appendChild(document.createElement("div"));
                        containerDiv.firstElementChild.appendChild(grid);
                        self.addListener(grid, "click", function () {
                            setTimeout(function () {
                                setGridWidth(grid);
                            }, 0);
                        });
                        grid.wrapped = true;
                    }
                    grid.parentElement.style.maxWidth = w;
                    grid.parentElement.classList.add("gridWrapper");
                    grid.parentElement.style.position = "static";
                    grid.parentElement.parentElement.style.position = "relative";
                    setFirstColumn(grid);
                    self.decorateInputs(grid);
                    self.decorateButtons(grid);
                }

                function setFirstColumn(grid) {
                    var firstCells = grid.querySelectorAll("tr td:first-child, tr th:first-child"),
                        w, i;

                    //remove any prior styles to assess auto dimensions of cells
                    for (i = 0; i < firstCells.length; ++i) {
                        firstCells[i].classList.add("pinnedCell");
                        firstCells[i].style.position = "static";
                        firstCells[i].style.width = "";
                        firstCells[i].style.height = "";
                        firstCells[i].parentElement.style.height = "";
                        grid.style.paddingLeft = "";
                    }

                    //wait for table to repaint before assessing width
                    setTimeout(function () {
                        w = firstCells[0].clientWidth;
                        grid.style.paddingLeft = w + "px";
                        for (i = 0; i < firstCells.length; ++i) {
                            firstCells[i].parentElement.style.height = firstCells[i].parentElement.clientHeight + "px";
                            firstCells[i].style.height = firstCells[i].parentElement.clientHeight - 1 + "px";
                            firstCells[i].style.position = "absolute";
                            firstCells[i].style.width = w + "px";
                        }
                    }, 0);
                }

                self.addListener(window, "resize", setAllGridWidths);

                if (window.YAHOO) {
                    self.addCallBack(YAHOO.widget.DataTable.prototype, "render", setGridWidth);
                }

                setTimeout(setAllGridWidths, 0);

                return grids;
            }

            this.decorateSelects = function () {
                //selects do not support pseudoelemtns in most browsers so add markup
                var selects = document.querySelectorAll("select"), i;

                for (i = 0; i < selects.length; ++i) {
                    if (!selects[i].hasAttribute("multiple") && !selects[i].decorated) {
                        downArrow = document.createElement("span");
                        downArrow.className = "downArrow";
                        if (selects[i].nextSibling) { //not nextElementSibling as text nodes with non breaking spaces after selects exist in legacy code base
                            selects[i].parentNode.insertBefore(downArrow, selects[i].nextSibling);
                        } else {
                            selects[i].parentNode.appendChild(downArrow);
                        }
                        selects[i].decorated = true;
                    }
                }
                return selects;
            }

            this.decorateInputs = function (el) {
                //inputs do not support pseudoelemtns in most browsers so add markup
                var inputs = (el || document).querySelectorAll("input[type=radio], input[type=checkbox]"),
                    fileInput = (el || document).querySelector("input[type=file]"),
                    i, placeholder, type, grid, fieldset, radioGroupContainer;

                for (i = 0; i < inputs.length; ++i) {
                    if (!inputs[i].parentElement.classList.contains("pseudo")) {

                        type = inputs[i].getAttribute("type").toLowerCase();
                        grid = self.closest(inputs[i], "[role=grid]");
                        fieldset = self.closest(inputs[i], "fieldset");
                        radioGroupContainer = (type == "radio" && (grid || fieldset));
                        if (radioGroupContainer) {
                            if (!radioGroupContainer.changeListenerAssigned) {
                                self.addListener(radioGroupContainer, "change", toggleAllChecks);
                                self.addListener(radioGroupContainer, "click", toggleAllChecks);
                                radioGroupContainer.changeListenerAssigned = true;
                            }
                        } else if (inputs[i].id == "clearAllCBX") {
                            self.addListener(inputs[i], "click", toggleAllChecks);
                        } else {
                            self.addListener(inputs[i], "change", toggleCheck);
                            self.addListener(inputs[i], "click", toggleCheck);
                        }

                        pseudoelement = document.createElement("span");
                        pseudoelement.className = "pseudo pseudo" + type;
                        inputs[i].parentElement.insertBefore(pseudoelement, inputs[i]);
                        pseudoelement.appendChild(inputs[i]);
                        toggleCheck(inputs[i]);
                    }
                }

                if (fileInput) {
                    self.styleFileInput(fileInput);
                }

                //workaround to prevent buggy behavior in depracated script methods in ProfileProvider.aspx markup
                //some form controls are actually not within the form
                var form = document.querySelector("form[name=frmProfileProviders]"), parent = form && form.parentElement;

                if (form) {
                    parent.parentElement.appendChild(form);
                    form.appendChild(parent);
                    window.action = "APPLY_SUBNOW";
                }

                function toggleAllChecks() {
                    var inputs = (el || document).querySelectorAll("input[type=radio], input[type=checkbox]"), i, stop;
                    for (i = 0, stop = inputs.length; i < stop; ++i) {
                        toggleCheck(inputs[i]);
                    }
                }

                function toggleCheck(input) {
                    if (input.target) {
                        input = input.target;
                    }
                    if (input.checked) {
                        input.parentElement.classList.add("checked");
                    } else {
                        input.parentElement.classList.remove("checked");
                    }
                }

                return inputs;
            };

            this.styleFileInput = function (input, label) {
                if (!input.styled) {

                    var label = label || document.querySelector('label[for="' + input.id + '"]') || (input.parentElement.previousElementSibling && input.parentElement.previousElementSibling.querySelector("label")),
                        button = document.createElement("button"),
                        i = document.createElement("i");

                    mockInput = document.createElement("input");
                    mockInput.setAttribute('role', 'presentation');
                    mockInput.setAttribute('tabindex', '-1');
                    mockInput.setAttribute('disabled', 'disabled');
                    mockInput.value = input.value;
                    i.className = "fa fa-upload";
                    button.setAttribute('type', 'button');
                    if (label && input.id) {
                        label.setAttribute("for", input.id);
                    }
                    button.className = "fileSearchButton";
                    button.appendChild(i);
                    input.parentNode.insertBefore(mockInput, input);
                    input.parentNode.insertBefore(button, input);
                    input.setAttribute("tabindex", -1);
                    input.setAttribute("aria-hidden", "true");

                    this.addListener(input, 'change', function () {
                        mockInput.value = input.value;
                    });

                    this.addListener(button, 'click', function () {
                        input.click();
                    });

                    input.styled = true;
                }

                return input;
            };

            this.decorateTabs = function () {
                var tabContainer = document.querySelector("#tabnav");

                if (tabContainer) {
                    self.hardOverwrite("#tabnav");
                    self.hardOverwrite("#tab_container");
                    self.addListener(tabContainer, "click", self.decorateGrids);
                }
            };

            this.decorateBody = function () {
                var fileNameRegEx = /.*\/([^/]+)\.([^?]+)/i,
                    fileName, openerName;

                document.body.classList.add("themed");
                document.body.classList.add("gateway");
                document.body.classList.add("legacy");
                try {
                    fileName = window.location.pathname.match(fileNameRegEx)[1];
                    document.body.classList.add(fileName);
                    if (window.opener) {
                        if (window.opener.pageSkinner) {
                            document.body.classList.add("popup");
                        }
                        openerName = "opened-by_" + (window.opener.location.pathname || "").match(fileNameRegEx)[1];
                        document.body.classList.add(openerName);
                    }
                } catch (Error) {
                }
                document.body.id = "gateway";
            };

            this.decorateDom = function () {
                var mainContentElement = document.querySelector("#pageContents");
                self.decorateBody();
                self.hardOverwrite("#profile_content", "veryLightAccentBkg");
                if (!mainContentElement) {
                    mainContentElement = document.querySelector("[role=main]");
                    if (mainContentElement) {
                        mainContentElement.id = "pageContents";
                    } else if (document.forms[0]) {
                        document.forms[0].id = "pageContents";
                    }
                }
                document.querySelector("h1").parentElement.classList.add("heading1Container");
                self.decorateTabs();
                self.decorateSelects();
                self.decorateInputs();
                self.setHeaderLinks();
                self.decorateButtons();
                self.decorateGrids();

                self.addListener(document.body, "change", function () {
                    //reassess on question branching
                    self.decorateSelects();
                    self.decorateInputs();
                })

                self.addCallBack(XMLHttpRequest.prototype, "send", function () {
                    var that = this, intervalId = window.setInterval(function () {
                        if (that.readyState != 4) {
                            return;
                        } else {
                            self.decorateInputs();
                            self.decorateSelects();
                        }
                    }, 200);
                });

                return document.body;
            };

            this.hardOverwrite = function (el, className) {
                if (typeof (el) === "string") {
                    el = document.querySelector(el);
                }
                if (el) {
                    el.style.border = "inherit";
                    el.style.backgroundColor = "inherit";
                    el.style.backgroundImage = "inherit";
                    el.style.color = "inherit";
                    el.style.lineHeight = "inherit";
                    if (className) {
                        el.parentElement.classList.add(className);
                    }
                }

                return el;
            }

            this.poll = function (fn, iMax, iInterval) {
                var i = 0, pollInterval;
                iMax = iMax || 200;
                iInterval = iInterval || 30;

                pollInterval = setInterval(function () {
                    if (i < iMax) {
                        if (fn(i) === true) {
                            clearInterval(pollInterval);
                        } else {
                            ++i;
                        }
                    } else {
                        clearInterval(pollInterval);
                    }
                }, iInterval);
            }

            this.addCallBack = function (obj, originalMethodName, callBackMethod, context, doBefore, appendOutcome) {
                var fnOriginal = obj[originalMethodName],
                    outcome;

                context = context || obj;

                obj[originalMethodName] = function () {
                    var doBeforeSuccessful,
                        outcome;

                    if (doBefore)
                        doBeforeSuccessful = callBackMethod.apply(this, arguments);

                    if (doBeforeSuccessful || !doBefore)
                        outcome = fnOriginal.apply(this, arguments);

                    if (!doBefore)
                        callBackMethod.apply(this, appendOutcome ? _(arguments).union([outcome]).value() : arguments);

                    return outcome;
                };
            };

            this.doBefore = function (obj, originalMethodName, callBackMethod, context) {
                self.addCallBack(obj, originalMethodName, callBackMethod, context, true);
            };

            this.addListener = function (el, sEventType, fn) {
                if (el && el.addEventListener)
                    el.addEventListener(sEventType, fn, false);
                else if (el && el.attachEvent)
                    el.attachEvent("on" + sEventType, fn);
            };

            this.closest = function (el, selector) {
                while (el && ! self.matches(el, selector)) {
                    el = el.parentElement;
                }
                return el;
            };

            this.matches = function (el, selector) {
                return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
            };

            this.writeStyle = function (css, title) {
                title = title || "dynamicStyles";

                var head = document.head || document.getElementsByTagName("head")[0],
                    style = style = document.querySelector('style[title=' + title + ']');

                if (style) {
                    style.disabled = true;
                    style.remove();
                }

                style = document.createElement('style');
                style.type = 'text/css';
                style.title = title;

                if (style.styleSheet) {
                    style.styleSheet.cssText = css;
                    style.styleSheet.title = title;
                } else {
                    style.appendChild(document.createTextNode(css));
                    style.title = title;
                }

                head.appendChild(style);
                return style;
            };

            this.formatCss = function (sCss) {
                return sCss.replace(/#Q#/g, '"').replace(/#SQ#/g, "'").replace(/#@#/g, "'").replace(/#T#/g, '\t').replace(/#N#/g, '\n').replace(/#BS#/g, '\\').replace(/varHeaderBackgroundColor/g, self.styleData.headerBackgroundColor.selected).replace(/varLinkColor/g, self.styleData.linkColor.selected).replace(/varBaseFontColor/g, self.styleData.baseFontColor.selected).replace(/varBackgroundColor/g, self.styleData.backgroundColor.selected).replace(/varFooterBackgroundColor/g, self.styleData.footerBackgroundColor.selected).replace(/varFooterLinkColor/g, self.styleData.footerLinkColor.selected);
            }

            this.dynamicCss = '.themed .pageHeader { background-color: varHeaderBackgroundColor; } input.socialLink { color: varLinkColor; } body a, body a:visited, body a:hover { color: varLinkColor; } #pageContents .tab { color: varLinkColor; } .HELPLinkQuestion:before { background-color: varBackgroundColor; } #pageContents table[role=grid] a.yui-dt-sortable { color: varLinkColor; } .button, button { background-color: varBaseFontColor; color: varBackgroundColor; } .pinnedCell, td.yui-dt-first, th.yui-dt-first { background-color: varBackgroundColor !important; } table[role=grid] .pseudoradio, table[role=grid] .pseudocheckbox { color: varLinkColor; } #pageContents .downArrow:after { color: varLinkColor; } body.themed, .backgroundColor { background-color: varBackgroundColor; } .themed.pageFooter { background-color: varFooterBackgroundColor; } .themed.pageFooter .footerLink, .themed.pageFooter .tgLocale, .themed.pageFooter a, .themed.pageFooter i { border-color: varFooterLinkColor; color: varFooterLinkColor; }';

            this.init();
        }


        if (!window.pageSkinner) {
            window.pageSkinner = new Page();
            window.isLegacyPage = true;
        }



        if (window.$ && $.fn && ! $.captureFocus) {

            $.extend({

                captureFocus: function ($el) {
                    //captures the focused element as required when launching a dialog
                    if (!($el instanceof $))
                        $el = null;
                    $.$priorFocus = $.$priorFocus || $();
                    $.$priorFocus = $.$priorFocus.add(($el && $el.eq(0)) || $(document.activeElement));
                },

                restoreFocus: function () {
                    //restores focus to a previously focused element as required when closing a dialog
                    if ($.$priorFocus) {
                        $.$priorFocus.eq(-1).focus();
                        $.$priorFocus.pop();
                    }
                },

                untrapFocus: function (bRestore) {
                    ($.$focusTrap || $()).untrapFocus(bRestore);
                },

                maintainFocus: function (e) {
                    if (!$.$focusTrap)
                        return;

                    var $focusable = $.$focusTrap.eq(-1).tabbable();

                    if (e.keyCode == $.keyCodes.tab) {
                        if (e.target == $focusable.last()[0] && !e.shiftKey) {
                            $focusable.first().focus();
                            e.preventDefault();
                        }
                        else if (e.target == $focusable.first()[0] && e.shiftKey) {
                            $focusable.last().focus();
                            e.preventDefault();
                        }
                    }
                }
            });

            $.fn.extend({
                on: $.fn.live,

                off: $.fn.die,

                pop: function () {
                    this.length = this[this.length - 1];
                },

                tabbable: function () {
                    return this.find("input, select, textarea, button, [tabindex]:visible, a[href]").not(":not([tabindex=-1])");
                },

                setFocus: function (uSelector, uNotSelector, nRecursion) {
                    //for accessibility
                    //method is meant to be used after ajax refresh
                    //finds the first tabbable element in this (the container) matching selectors if present
                    //returns jquery object containing that element and sets focus to it
                    var nMaxRecursion = 10,
                        that = this,
                        $focusEl;

                    _.delay(function () {
                        //wait for possible angular compile and render
                        var $focusable = that.tabbable().filter($(uSelector || "*")).not(uNotSelector || ".fieldHelp"),
                            $focusEl = $focusable.length > 1 ? $focusable.not("[class*=close], a[class*=back], .backLink > a").eq(0) : $focusable;

                        $focusEl.focus();
                        nRecursion = nRecursion || 0;
                        if ($focusEl[0] !== document.activeElement && nRecursion < nMaxRecursion)
                            _.delay(function () {
                                that.setFocus(uSelector, uNotSelector, (nRecursion + 1));
                            }, 250);
                    }, 0)

                    return this;
                },

                trapFocus: function (uSelector, uNotInitialSelector, bFocus, bRemoveFocus, bCaptureFocus) {
                    //for accessible modal dialogs
                    //sets focus within the dialog (unless bFocus is EXPLICITLY set to false)
                    //traps keyboard navigation within a circular tab order
                    //restores focus properly upon closing dialog (unless bFocus is EXPLICITLY set to false)
                    //last two arguments are important when widgets are frequently repainting and taking focus actions independently
                    var that = this,
                        bRetrapSame = $.$focusTrap && this.equals($.$focusTrap.eq(-1));

                    if (!this.length) {
                        return this;
                    }

                    if (bCaptureFocus !== false)
                        $.captureFocus();

                    $.untrapFocus(false);

                    $.$focusTrap = ($.$focusTrap || $()).add(this.eq(0));

                    this.keydown($.maintainFocus);

                    //avoid setting initial focus to a close button in a dialog
                    //unless it's an alert style dialog with no other focusable elements
                    if (that.tabbable().length > 1 && !uNotInitialSelector)
                        uNotInitialSelector = "[class*=close]";

                    if (bFocus !== false)
                        this.setFocus(uSelector, uNotInitialSelector);

                    if (bRemoveFocus === true) {
                        this.focusLeave(function () {
                            //this approach to untrapping focus has been abandoned but can be utilized with the bRemoveFocus argument
                            setTimeout(function () {
                                if ($.$focusTrap.eq(-1).equals(that)) {
                                    $.untrapFocus();
                                }
                            })
                        })
                    }

                    return this;
                },

                focusLeave: function (fnHandler, oContext) {
                    //trigger handler if focus has left the container element
                    //this is more of a promise than a listener
                    //it removes listener upon execution of handler
                    var that = this;

                    document.body.addEventListener("blur", checkFocusLeave, true);
                    document.body.addEventListener("focus", checkFocusLeave, true);
                    $(document.body).keydown(checkFocusLeave);
                    $(document.body).click(checkFocusLeave);

                    return this;

                    function checkFocusLeave(e) {
                        var newEvent = _.clone(e, true), bHandled;

                        newEvent.type = "focusleave";

                        //delay for other focus methods to execute and to avoid momentary activeElement of body
                        setTimeout(function () {
                            var bThisIsGone = !that.is(":visible"),
                                bFocusLeft = !that.find(document.activeElement).exists();

                            //if focus has left our container, call the handler
                            if ((bThisIsGone || bFocusLeft) && !bHandled) {
                                fnHandler.apply(oContext || that, [newEvent]);
                                bHandled = true;
                                document.body.removeEventListener("blur", checkFocusLeave, true);
                                document.body.removeEventListener("focus", checkFocusLeave, true);
                                $(document.body).off("click", checkFocusLeave);
                                $(document.body).off("keydown", checkFocusLeave);
                            }
                        }, 0)
                    }
                },

                trapFocusInAncestor: function (uSelector) {
                    this.closest(uSelector || "body").trapFocus();
                    return this;
                },

                untrapFocus: function (bRestore) {
                    var that = this,
                        $trapHere;

                    if (bRestore !== false) {
                        $.restoreFocus();
                        $.$focusTrap = $.$focusTrap || $();
                        if ($.$focusTrap.length > 1) {
                            $.$focusTrap.pop();
                            $trapHere = $.$focusTrap.eq(-1);
                            $.$focusTrap.pop();//pop where we will trap ($trapHere) from collection since trapFocus will add it right back
                            $trapHere.trapFocus(null, null, false, null, false);
                        }
                    }
                    that.off("keydown", $.maintainFocus).off("focusout", $.untrapFocus);

                    return that;
                }
            });
        }
    })();
}
