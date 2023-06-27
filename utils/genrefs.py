#! /usr/bin/env python

import os
import sys
import re
import json

rootdir = 'content/'
refs = {}
ref_pattern = r'{{(?:<\s*(?:rel)?ref\s+(?:"(.+?)"|(\S+?))\s*>|%\s*(?:rel)?ref\s+(?:"(.+?)"|(\S+?))\s*%)}}'
heading_pattern = r'^(#{1,6})\s+(?P<title>.*?)\s*({(.*#(\S*)|(?:.*\s|)id="(\S*)")*(.*#(?P<id1>\S*)|(?:.*\s|)id="(?P<id2>\S*)").*}|{.*})?$'
ext_pattern = r'(\.md|/?index\.md|/?_index\.md)$'
check = ('-c' in sys.argv) or ('--check' in sys.argv)
format = ('-f' in sys.argv) or ('--format' in sys.argv)
ref_in_heading = ('--ref-in-heading' in sys.argv)

def check_anchor(file, anchor):
  is_contained = False
  anchor_pattern = r'(^|\n)#{{1,6}}\s+{anc}(\s*{{.*}})?($|\n)|{{.*?(#{anc}|id="{anc}").*?}}|{{{{<.*?(id="{anc}"|id={anc}.*?)>}}}}|{{{{%.*?(id="{anc}"|id={anc}).*?%}}}}'.format(anc = re.escape(anchor))
  anchor_pattern = re.sub(r'\\[ -]', '[ -]', anchor_pattern)  # " " == "-"
  with open(file, 'r') as f:
    if re.search(anchor_pattern, f.read(), re.IGNORECASE):
      is_contained = True

  return is_contained

# return file, anchor
#   - file: file path like 'series/病原生物学/_index.md'
#   - anchor: anchor, '' for empty heaing and top
def ref2pos(ref, reldir, path, linenr):
  [file, anchor] = ref.split('#') if len(ref.split('#')) == 2 else [ref, '']

  # remove '.md'
  if file.endswith('.md'):
    file = file[:-3]

  found_realtive = False
  if not file.startswith('/'):                              # relative path
    for subdir, _, files in os.walk(reldir):
      for f in files:
        full_path = subdir + '/' + f
        if re.search('(' + re.escape('/'+file) + ')' + ext_pattern, full_path):
          found_realtive = True
          file = full_path
          if check and anchor and (not check_anchor(full_path, anchor)):
            print('[Warning] {path}:{linenr}:"{orig}", "{anchor}" not found in "{file}"'.format(orig=ref, file=full_path, anchor=anchor, path=path, linenr=linenr))
  if file.startswith('/') or found_realtive == False:       # absolute path
    for subdir, _, files in os.walk(rootdir):
      for f in files:
        full_path = subdir + '/' + f
        base = re.escape(rootdir) + ("" if file.startswith('/') else ".*") + "/" + re.escape(file)
        if re.search('(' + base + ')' + ext_pattern, full_path):
          file = full_path
          if check and anchor and (not check_anchor(full_path, anchor)):
            print('[Warning] {path}:{linenr}:"{orig}", "{anchor}" not found in "{file}"'.format(orig=ref, file=full_path, anchor=anchor, path=path, linenr=linenr))

  return file[len(rootdir):], anchor

# get refs in file specified by path
def get_refs(path):
  file_from = re.sub(ext_pattern, '', path[len(rootdir):]) # remove rootdir and ext_pattern in path
  current_heading = '' # for empty heading and top
  in_code_block = { 'level': 0, 'type': 0, 'kroki': False }

  linenr = 0
  for line in open(path, 'r', encoding='utf-8').readlines():
    linenr = linenr + 1

    # skip code block
    code_fence = re.match(r'^\s*(`{3,}|~{3,})(\s*(\w*))?', line)
    if code_fence:
      code_fence = {
        'level': len(code_fence[1]),
        'type': 1 if code_fence[1][0] == '`' else 2,
        'kroki': code_fence[3] == 'kroki'
      }
      if not in_code_block['level']:
        in_code_block = code_fence                                      # beginning fence
      else:
        if in_code_block['type'] == code_fence['type']:
          if in_code_block['level'] == code_fence['level']:
            in_code_block = { 'level': 0, 'type': 0, 'kroki': False }   # ending fence
          elif in_code_block['level'] < code_fence['level']:
            exit("[ERROR] unclosed code block")

    if code_fence or (in_code_block['level'] and not in_code_block['kroki']):
      continue

    # try updating current heaing
    heading_results = re.search(heading_pattern, line)
    if heading_results:
      if (heading_results['id1'] or heading_results['id2']):
        current_heading = heading_results['id1'] or heading_results['id2']
      else:
        current_heading = heading_results['title']
      if not ref_in_heading:
        continue

    # add refs
    ref_results = re.findall(ref_pattern, line)
    if ref_results:
      for ref_result in ref_results:
        slice = re.match(r'(.*/)(.*)', path)
        if slice:
          parent_dir = slice[1]
        else:
          exit('[ERROR] fail to get parent directory of path "{path}"'.format(path = path))

        # convert hugo ref to standard (path, anchor)
        p, a = ref2pos(ref_result[0] or ref_result[1] or ref_result[2] or ref_result[3], parent_dir, path, linenr)

        # ensure refs[p][a] exists
        if p not in refs:
          refs[p] = {
            'file_ref': '/' + re.sub(ext_pattern, '', p),
            'count': 0,
            'link_here': { a: {} }
          }
        elif a not in refs[p]['link_here']:
          refs[p]['link_here'][a] = {}

        if p == '':
          print('[Warning] get empty source filename: line {linenr} in "{file}: {line}"'.format(linenr = linenr, file = path, line = line))

        # add backlink and count
        backlink = '/' + file_from + ('#'+current_heading if current_heading!='' else '')
        if backlink in refs[p]['link_here'][a]:
          refs[p]['link_here'][a][backlink] += 1
        else:
          refs[p]['link_here'][a][backlink] = 1
        refs[p]['count'] += 1

  linenr = 0


if __name__ == '__main__':
  for subdir, dirs, files in os.walk(rootdir):
    for file in files:
      if file.endswith('.md'):
        get_refs(subdir + '/' + file)

  if not os.path.exists('data/'):
    os.makedirs('data')
  if format:
    with open('data/refs.json', 'w', encoding='utf-8') as f:
      json.dump(refs, f, ensure_ascii=False, indent=4)
  else:
    with open('data/refs.json', 'w', encoding='utf-8') as f:
      json.dump(refs, f, ensure_ascii=False)
  print('=> cross reference data is saved in data/refs.json')
