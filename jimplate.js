(function(win){
	var Jimplate = win.Jimplate = function(markup, options) {
		var opts = options || {},
			stack = [],
			reBlank = new RegExp('^\\s*$'),
			reVariable = new RegExp('\\$\\{([^\\}]+)\\}', 'g'),
			//code = 'var $varPattern = new RegExp("' + reVariable.source.replace(/\\/g, '\\\\') + '", "g");',
			code = '',
			nextIdentifier = (function() {
				var names = {};
				return function(tag) {
					if (typeof names[tag] == 'undefined')
						names[tag] = 0;
					else
						names[tag]++;

					return tag + names[tag];
				};
			})(),
			current = function() {
				if (stack.length) {
					return stack[stack.length - 1];
				}
				return '__parent';
			},
			interpolate = function(text) {
				if (reVariable.test(text)) {
					//does the text contains just a single variable expression?
					if (new RegExp('^' + reVariable.source + '$').test(text)) {
						return text.replace(reVariable, function(match, field){
							return '__model.' + field;
						});
					}
					else {
						var chunks = [],
							lastIndex = 0,
							processedIndex = 0;
						text.replace(reVariable, function(match, field, index) {
							if (index > lastIndex) {
								chunks.push('"' + text.substring(lastIndex, index) +  '"');
							}
							chunks.push('__model.' + field);
							lastIndex = index;
							processedIndex = index + match.length;
						});
						chunks.push('"' + text.substring(processedIndex) + '"');
						return chunks.join('+');
					}
				}
				else {
					return '"' + text + '"';
				}
			};

		if (opts.loop) {
			code += 'var __wholeModel = __model;\nfor (var $i = 0; $i < __wholeModel.length; $i++) {\nvar __model = __wholeModel[$i];\n';
		}

		HTMLParser(markup, {
			start: function(tag, attrs, unary) {
				var varName = nextIdentifier(tag),
					attrLen = attrs.length;
				code += ['var ', varName, '=doc.createElement("', tag, '");\n'].join('');

				for (var i = 0; i < attrLen; i++) {
					var attr = attrs[i];
					code += [ varName, '.setAttribute("', attr.name, '",', interpolate(attr.value) , ');\n'].join('');
				}

				if (unary) {
					code += [current(), '.appendChild(', varName, ');\n'].join('');
				}
				else {
					stack.push(varName);
				}
			},
			end: function(tag) {
				var varName = stack.pop();
				code += [ current(), '.appendChild(', varName, ');\n'].join('');
			},
			chars: function(text) {
				if (text.length > 0 && !reBlank.test(text)) {
					var replaced = interpolate(text);
					code += [ current(), '.appendChild(doc.createTextNode(', replaced ,'));\n'].join('');
				}
			}
		});

		if (opts.loop) {
			code += ' }\n';
		}

		console.log(code);

		var buildFn = new Function('doc', '__parent', '__model', '__varPattern', code);
		return function(model) {
			var doc = win.document,
				fragment = doc.createDocumentFragment();
			buildFn(doc, fragment, model, reVariable);
			return fragment.childNodes.length == 1 ? fragment.childNodes[0] : fragment;
		};
	};
})(this);