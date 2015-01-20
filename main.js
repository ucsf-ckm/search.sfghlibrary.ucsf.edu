var amalgamatic = require('amalgamatic');

var pubmed = require('amalgamatic-pubmed');
pubmed.setOptions({tool: '', otool: '', holding: 'causalib'});

var millennium = require('amalgamatic-millennium');
millennium.setOptions({url: 'http://cors-anywhere.herokuapp.com/ucsfcat.library.ucsf.edu/search/X'})

amalgamatic.add('pubmed', pubmed);
amalgamatic.add('millennium', millennium);

var realDomain = {
    millennium: 'http://ucsfcat.library.ucsf.edu/'
};
var search = function (searchTerm, res) {
    var callback = null;

    var options = {
        searchTerm: searchTerm.toLowerCase(),
        pluginCallback: function (err, result) {
            var elem = document.getElementById(result.name);
            if (elem) {
                elem.innerHTML='';

                if (err) {
                    elem.textContent = err.message;
                } else {
                    if (result.data.length) {
                        var ol = document.createElement('ol');
                        var li, a;
                        var href, name;
                        for (var i = 0, l = result.data.length; i < l; i++) {
                            li = document.createElement('li');
                            a = document.createElement('a');
                            href = result.data[i].url.match(/^(https?:)?\/\/[\w:\/\?&%=\.\-~\+]+$/)[0];
                            href = href.replace(/^http:\/\/cors-anywhere.herokuapp.com(:80)?/, realDomain[result.name]);
                            a.setAttribute('href', href);
                            a.textContent = result.data[i].name;
                            li.appendChild(a);
                            ol.appendChild(li);
                        }
                        elem.appendChild(ol);

                        if (typeof result.url === "string") {
                            var realUrl = result.url.replace(/^(https?:\/\/)cors-anywhere.herokuapp.com/, function (match, p1) { return p1; });
                            var allResults = document.createElement('a');
                            allResults.setAttribute('href', realUrl);
                            allResults.appendChild(document.createTextNode('All results'));
                            elem.appendChild(allResults);
                        }
                    } else {
                        elem.innerHTML = '<i>No results. :-(</i>';
                    }
                }

            } else {
                console.log('Error: #' + result.name + ' not found');
            }

            if (result.name === "pubmed" && result.suggestedTerms instanceof Array) {
                showSuggestedTerms(result.suggestedTerms[0]);
            } 
        }
    };

    amalgamatic.search(options);
};

var showSuggestedTerms = function (suggestedTerms) {
    if (suggestedTerms) {
        var termsLink = document.createElement('a');
        termsLink.setAttribute('href', '?q=' + encodeURIComponent(suggestedTerms));
        var em = document.createElement('em');
        em.textContent = suggestedTerms;
        termsLink.appendChild(em);

        var didyoumean = document.getElementById('didyoumean');
        didyoumean.setAttribute('class', 'row');
        var alertBox = document.createElement('div');
        alertBox.setAttribute('class', 'alert-box info');

        var span = document.createElement('span');
        var startText = document.createTextNode('Did you mean ');
        var endText = document.createTextNode('?');
        span.appendChild(startText);
        span.appendChild(termsLink);
        span.appendChild(endText);
        alertBox.appendChild(span);
        didyoumean.appendChild(alertBox);
    }
};

var searchTermsRegExp = new RegExp("[\\?&]q=([^&#]*)");
var searchTermsMatch = searchTermsRegExp.exec(window.location.search);

var searchTerms;

if (searchTermsMatch) {
    searchTerms = decodeURIComponent(searchTermsMatch[1].replace(/\+/g, " "));
}

if (searchTerms) {
    document.addEventListener('DOMContentLoaded', function () {
        var i,l;

        search(searchTerms);

        var resultIds = ['pubmed', 'millennium'];
        var resultElem;
        for (i=0, l=resultIds.length; i<l; i++) {
            resultElem = document.getElementById(resultIds[i]);
            if (resultElem) {
                resultElem.appendChild(document.createElement('progress'));
            }
        }

        var searchInputs = document.getElementsByClassName('amalgamatic-search');
        for (i=0, l=searchInputs.length; i<l; i++) {
            searchInputs[i].setAttribute('value', searchTerms);
        }
    });
}
