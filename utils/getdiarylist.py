#! /usr/bin/env python

import os
import re
import json

diary_root = 'content' + os.sep + 'diary' + os.sep
diaries = {}

if __name__ == '__main__':
  for subdir, dirs, files in os.walk(diary_root):
    for file in files:
      fullpath = subdir + os.sep + file
      matches = re.match(re.escape(diary_root)+r"(\d*)/(\d*)/(\d*)(\.md|/index\.md)", fullpath)
      if matches:
        if matches[1] not in diaries:
          diaries[matches[1]] = {}
        if matches[2] not in diaries[matches[1]]:
          diaries[matches[1]][matches[2]] = {}

        diaries[matches[1]][matches[2]][matches[3]] = True

  if not os.path.exists('static/'):
    os.makedirs('static')
  if not os.path.exists('static/data/'):
    os.makedirs('static/data/')
  with open('static/data/diaries.json', 'w', encoding='utf-8') as f:
    json.dump(diaries, f, ensure_ascii=False)
