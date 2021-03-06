var Hamlet, attrMatch, emptyTags, fillAttrs, indexOf, join_attrs, makeMap, parse_attrs;
Hamlet = function(str, data){
    var c  = Hamlet.templateSettings;
    str = Hamlet.toHtml(str);
    var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
      'with(obj||{}){__p.push(\'' +
      str.replace(/\\/g, '\\\\')
         .replace(/'/g, "\\'")
         .replace(c.interpolate, function(match, code) {
           return "'," + code.replace(/\\'/g, "'") + ",'";
         })
         .replace(/\r/g, '\\r')
         .replace(/\n/g, '\\n')
         .replace(/\t/g, '\\t')
         + "');}return __p.join('');";
    var func = new Function('obj', tmpl);
    return data ? func(data) : func;
  };
;
Hamlet.templateSettings = {
  interpolate: /\{\{([\s\S]+?)\}\}/g
};
Hamlet.toHtml = function(html) {
  var content, innerHTML, last_tag_indent, line, needs_space, oldp, oldt, pos, push_innerHTML, si, tag_attrs, tag_name, tag_portion, tag_stack, ti, unindented, _i, _len, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
  content = [];
  tag_stack = [];
  last_tag_indent = 0;
  needs_space = false;
  push_innerHTML = function(str) {
    var i;
    if (i = indexOf(str, '#')) {
      str = str.substring(0, i);
    }
    needs_space = true;
    return content.push(str);
  };
  _ref = html.split(/\n\r*/);
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    line = _ref[_i];
    pos = 0;
    while (line[pos] === ' ') {
      pos += 1;
    }
    unindented = line.substring(pos);
    if (unindented.length === 0) {
      content.push(' ');
    } else if (unindented[0] === '#') {} else {
      if (pos <= last_tag_indent) {
        if (tag_stack.length > 0 && pos === last_tag_indent) {
          _ref2 = tag_stack.pop(), oldp = _ref2[0], oldt = _ref2[1];
          last_tag_indent = ((_ref3 = tag_stack[tag_stack.length - 1]) != null ? _ref3[0] : void 0) || 0;
          content.push("</" + oldt + ">");
        }
        while (tag_stack.length > 0 && pos < last_tag_indent) {
          needs_space = false;
          _ref4 = tag_stack.pop(), oldp = _ref4[0], oldt = _ref4[1];
          last_tag_indent = ((_ref5 = tag_stack[tag_stack.length - 1]) != null ? _ref5[0] : void 0) || 0;
          content.push("</" + oldt + ">");
        }
      }
      if (unindented[0] === '>') {
        unindented = unindented.substring(1);
        needs_space = false;
      }
      if (needs_space) {
        content.push(" ");
      }
      needs_space = false;
      if (unindented[0] !== '<') {
        push_innerHTML(unindented);
      } else {
        last_tag_indent = pos;
        innerHTML = "";
        tag_portion = unindented.substring(1);
        if (ti = indexOf(unindented, '>')) {
          tag_portion = unindented.substring(1, ti);
          if (tag_portion[tag_portion.length] === "/") {
            tag_portion = tag_portion.substring(innerHTML.length - 1);
          }
          innerHTML = unindented.substring(ti + 1);
        }
        tag_attrs = "";
        tag_name = tag_portion;
        if (si = indexOf(tag_portion, ' ')) {
          tag_name = tag_portion.substring(0, si);
          tag_attrs = tag_portion.substring(si);
        }
        if (tag_name[0] === '#') {
          tag_attrs = "id=" + tag_name.substring(1) + tag_attrs;
          tag_name = "div";
        }
        if (tag_name[0] === '.') {
          tag_attrs = "class=" + tag_name.substring(1) + tag_attrs;
          tag_name = "div";
        }
        if (emptyTags[tag_name]) {
          content.push("<" + tag_name + "/>");
        } else {
          tag_stack.push([last_tag_indent, tag_name]);
          if (tag_attrs.length === 0) {
            content.push("<" + tag_name + ">");
          } else {
            content.push(("<" + tag_name) + join_attrs(parse_attrs(tag_attrs)) + ">");
          }
          if (innerHTML.length !== 0) {
            push_innerHTML(innerHTML);
          }
        }
      }
    }
  }
  while (tag_stack.length > 0) {
    _ref6 = tag_stack.pop(), oldp = _ref6[0], oldt = _ref6[1];
    content.push("</" + oldt + ">");
  }
  return content.join("");
};
indexOf = function(str, substr) {
  var i;
  i = str.indexOf(substr);
  if (i === -1) {
    return null;
  } else {
    return i;
  }
};
makeMap = function(str) {
  var i, items, obj, _i, _len;
  obj = {};
  items = str.split(",");
  for (_i = 0, _len = items.length; _i < _len; _i++) {
    i = items[_i];
    obj[items[i]] = true;
  }
  return obj;
};
attrMatch = /(?:\.|#)?([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;
fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");
emptyTags = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");
parse_attrs = function(html) {
  var attrs, classes;
  attrs = [];
  classes = [];
  html.replace(attrMatch, function(match, name) {
    var val, value;
    if (match[0] === ".") {
      classes.push(name);
    } else {
      value = match[0] === "#" ? (val = name, name = "id", val) : arguments[2] || arguments[3] || arguments[4] || (fillAttrs[name] ? name : "");
      if (name === "class") {
        classes.push(value);
      } else {
        attrs.push([name, value.replace(/(^|[^\\])"/g, '$1\\\"')]);
      }
    }
  });
  if (classes.length > 0) {
    attrs.push(["class", classes.join(" ")]);
  }
  return attrs;
};
join_attrs = function(attrs) {
  var attr, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = attrs.length; _i < _len; _i++) {
    attr = attrs[_i];
    _results.push(" " + attr[0] + '="' + attr[1] + '"');
  }
  return _results;
};