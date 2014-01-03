Jimplate.js - Javascript client-side template engine
------------------

Instead of traditional string concatenation Jimplate uses evaluated code (`new Function`) and DOM methods to construct HTML elements from a given template and model. Jimplate uses John Resig's [HTMLParser](http://ejohn.org/blog/pure-javascript-html-parser/)

Usage
------------------
* Add placeholder for your elements

```html
<ul id="the-list"></ul>
```

* Somewhere in your page include the necessary dependencies:

```html
<script src="htmlparser.js"></script>
<script src="jimplate.js"></script>
```

* Add your template to the page:

```html
<script id="t-person-entry" type="text/x-template">
	<li class="person">
		<img src="img/${gender}.png"/>
		<dl>
			<dt>First Name</dt>
			<dd>${firstName}</dd>
			<dt>Last Name</dt>
			<dd>${lastName}</dd>
		</dl>
	</li>
</script>
```

* Some time on page startup construct Jimplate factory method, for example:

```javascript
var template,
    list;
document.addEventListener('DOMContentLoaded', function() {
  template = Jimplate(document.getElementById('t-person-entry').innerHTML, { loop: true });
  list = document.getElementById('the-list');
}, false);
```

* Use the `template`, assuming jQuery:

```javascript
$.get(someUrl, function(data) {
  var entries = JSON.parse(data);
  list.append(template(entries));
});
```

Jimplate options argument `{loop: true}` gives code generator a hint that this factory method will be working with an array, collection, thus generating the wrapping `for (...)` loop.
