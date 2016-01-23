#-*- encoding:utf-8 -*-
from __future__ import print_function

import sys
try:
	reload(sys)
	sys.setdefaultencoding('utf-8')
except:
	pass

import codecs
from textrank4zh import TextRank4Keyword, TextRank4Sentence

# text = codecs.open('./newsCrawler/TextRank4ZH/example/temp.txt', 'r', 'utf-8').read()

def generate(text_input):
	tr4w.analyze(text=text_input, lower=True, window=2)
	tr4s.analyze(text=text_input, lower=True, source = 'all_filters')
	temp = []
	temp2 = []
	for item in tr4s.get_key_sentences(num=5):
		temp.append(item.sentence)
	
	for obj in tr4s.sentences:
		if obj in temp:
			temp2.append(obj)
	
	sentences_to_print = ''
	for sentence in temp2:
		sentences_to_print += sentence + '。'
	
	print(sentences_to_print)

	temp3 = []
	for item in tr4w.get_keywords(20, word_min_len=1):
		if item.weight >= 0.027:
			temp3.append(item.word)
	keyword_to_print = ''
	for keywords in temp3:
		keyword_to_print += keywords + '\t'
	print(keyword_to_print)

if __name__ == "__main__":
	tr4w = TextRank4Keyword()
	tr4s = TextRank4Sentence()
	while(True):
		textToGenerate = raw_input()
		generate(textToGenerate)