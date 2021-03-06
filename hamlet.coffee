# * Hamlet Html Templates for javascript. http://www.yesodweb.com/book/templates
# Re-uses some code from HTML Parser By John Resig (ejohn.org)
# * LICENSE: Mozilla Public License

# this one javascript function is _.template from underscore.js, MIT license
# remove escape and evaluate, just use interpolate   
Hamlet = `function(str, data){
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
`


Hamlet.templateSettings = {
  interpolate    : /\{\{([\s\S]+?)\}\}/g,
}

Hamlet.toHtml = (html) ->
  content = []
  tag_stack = []
  last_tag_indent = 0
  needs_space = false

  push_innerHTML = (str) ->
    if i = indexOf(str, '#')
      str = str.substring(0, i)

    needs_space = true
    content.push(str)

  for line in html.split(/\n\r*/)
    pos = 0
    pos += 1 while line[pos] == ' '
    unindented = line.substring(pos)

    if unindented.length == 0
      content.push(' ')

    else if unindented[0] == '#'

    else
      if pos <= last_tag_indent
        if tag_stack.length > 0 and pos == last_tag_indent
          [oldp, oldt] = tag_stack.pop()
          last_tag_indent = tag_stack[tag_stack.length - 1]?[0] || 0
          content.push("</#{oldt}>")

        while tag_stack.length > 0 and pos < last_tag_indent
          needs_space = false
          [oldp, oldt] = tag_stack.pop()
          last_tag_indent = tag_stack[tag_stack.length - 1]?[0] || 0
          content.push("</#{oldt}>")

      if unindented[0] == '>'
        unindented = unindented.substring(1)
        needs_space = false

      content.push(" ") if needs_space
      needs_space = false

      if unindented[0] != '<'
        push_innerHTML(unindented)

      else
        last_tag_indent = pos

        innerHTML = ""
        tag_portion = unindented.substring(1)
        if ti = indexOf(unindented, '>')
          tag_portion = unindented.substring(1, ti)
          if tag_portion[tag_portion.length] == "/"
            tag_portion = tag_portion.substring(innerHTML.length - 1)
          innerHTML = unindented.substring(ti + 1)

        tag_attrs = ""
        tag_name = tag_portion
        if si = indexOf(tag_portion, ' ')
          tag_name = tag_portion.substring(0, si)
          tag_attrs = tag_portion.substring(si)

        if tag_name[0] == '#'
          tag_attrs = "id=" + tag_name.substring(1) + tag_attrs
          tag_name = "div"
        if tag_name[0] == '.'
          tag_attrs = "class=" + tag_name.substring(1) + tag_attrs
          tag_name = "div"

        if emptyTags[tag_name]
          content.push("<#{tag_name}/>")
        else
          tag_stack.push([last_tag_indent, tag_name])

          if tag_attrs.length == 0
            content.push( "<#{tag_name}>")
          else
            content.push( "<#{tag_name}" +
              join_attrs(parse_attrs(tag_attrs)) + ">"
            )

          unless innerHTML.length == 0
            push_innerHTML(innerHTML)

  while tag_stack.length > 0
    [oldp, oldt] = tag_stack.pop()
    content.push("</#{oldt}>")

  content.join("")


indexOf = (str, substr) ->
  i = str.indexOf(substr)
  if i == -1 then null else i

makeMap = (str) ->
    obj = {}
    items = str.split(",")
    for i in items
        obj[ items[i] ] = true
    return obj

attrMatch = /(?:\.|#)?([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g
fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected")

emptyTags = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed")

parse_attrs = (html) ->
  attrs = []
  classes = []
  # TODO: more efficient function then replace? we don't need to replace
  html.replace attrMatch, (match, name) ->
    if match[0] == "."
      classes.push( name )
    else
      value = if match[0] == "#"
        val = name
        name = "id"
        val
      else
        arguments[2] || arguments[3] || arguments[4] ||
          if fillAttrs[name]
            name
          else
            ""
      if name == "class"
        classes.push( value )
      else
        attrs.push([name,
          value.replace(/(^|[^\\])"/g, '$1\\\"')
        ])
    return

  if classes.length > 0
    attrs.push(["class", classes.join(" ")])

  attrs

join_attrs = (attrs) ->
  for attr in attrs
    " " + attr[0] + '="' + attr[1] + '"'
