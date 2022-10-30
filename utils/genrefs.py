#! /usr/bin/env python

import os
import re
import json
rootdir = 'content/'  # use os.sep
ref_in_heading = True
# empty_heading_prefix = 'heading' # Hugo's default heading id prefix of empty heading
refs = {}
ref_pattern = r'\[.*?\]\({{(<\s*(rel)?ref\s+("(.+?)"|(\S+?))\s*>|%\s*(rel)?ref\s+("(.+?)"|(\S+?))\s*%)}}\)'
heading_pattern = r'^(#{1,6})\s+(.*?)(\s*{.*})?$'
ext_pattern = r'(\.md|/index\.md|/_index\.md)$'


# return (file, anchor)
#   - file: file path that can be use in Hugo, like 'series/病原生物学/_index.md'
#   - anchor: the anchor which is above the link, '' for empty heaing and top
def ref2pos(ref, reldir):
    [file, anchor] = ref.split('#') if len(ref.split('#')) == 2 else [ref, '']

    # remove '.md'
    if file.endswith('.md'):
        file = file[:-3]

    found = False
    if not file.startswith('/'):
        for subdir, _, files in os.walk(reldir):
            for f in files:
                full_path = os.path.join(subdir, f)
                if re.search('(' + re.escape(os.sep+file) + ')' + ext_pattern, full_path):
                    file = full_path
                    found = True
    if file.startswith('/') or found == False:
        for subdir, _, files in os.walk(rootdir):
            for f in files:
                full_path = os.path.join(subdir, f)
                if re.search('(' + os.path.join(re.escape(rootdir), "" if file.startswith('/') else ".*", re.escape(file)) + ')' + ext_pattern, full_path):
                    file = full_path

    return (file[len(rootdir):], anchor)


def get_refs(path):
    in_code_block1 = False
    in_code_block2 = False
    file_from = re.sub(ext_pattern, '', path[len(rootdir):]) # remove rootdir and ext_pattern in path
    current_heading = '' # for empty heading and top

    for line in open(path, 'r').readlines():
        if re.match(r'```(|[^`].*)$', line): # starts with ```(xxxx)?
            in_code_block1 = not in_code_block1
        if in_code_block1:
            continue
        if re.match(r'~~~(|[^~].*)$', line): # starts with ~~~(xxxx)?
            in_code_block2 = not in_code_block2
        if in_code_block2:
            continue

        # try updating current heaing
        heading_results = re.findall(heading_pattern, line)
        if heading_results:
            current_heading = heading_results[0][1]
            if not ref_in_heading:
                continue

        # add refs
        ref_results = re.findall(ref_pattern, line)
        if ref_results:
            for ref_result in ref_results:
                parent_dir = re.match(r'(.*'+re.escape(os.sep)+')(.*)', path)[1]
                pos = ref2pos(ref_result[3] or ref_result[4] or ref_result[7] or ref_result[8], parent_dir)
                print(ref_result[3] or ref_result[4] or ref_result[7] or ref_result[8])

                # ensure refs[pos[0]][pos[1]] exists
                if pos[0] not in refs:
                    refs[pos[0]] = {}
                    refs[pos[0]]['file_ref'] = '/' + re.sub(ext_pattern, '', pos[0])
                    refs[pos[0]]['count'] = 0
                    refs[pos[0]]['link_here'] = { pos[1]: {} }
                elif pos[1] not in refs[pos[0]]['link_here']:
                    refs[pos[0]]['link_here'][pos[1]] = {}

                if pos[0] == '':
                    print('Warning: empty filename:', '"'+ref_result[0]+'"', 'in', path)

                backlink = '/' + file_from + ('#'+current_heading if current_heading!='' else '')
                if backlink in refs[pos[0]]['link_here'][pos[1]]:
                    refs[pos[0]]['link_here'][pos[1]][backlink] += 1
                else:
                    refs[pos[0]]['link_here'][pos[1]][backlink] = 1
                refs[pos[0]]['count'] += 1


if __name__ == '__main__':
    for subdir, dirs, files in os.walk(rootdir):
        for file in files:
            if file.endswith('.md'):
                get_refs(os.path.join(subdir, file))

    if not os.path.exists('data/'):
        os.makedirs('data')
    with open('data/refs.json', 'w', encoding='utf-8') as f:
        json.dump(refs, f, ensure_ascii=False, indent=4)
