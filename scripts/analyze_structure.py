#!/usr/bin/env python3
"""
分析Word文档结构，提取所有学科的核心素养
"""
import sys
from docx import Document

def analyze_structure(file_path):
    """分析文档结构"""
    doc = Document(file_path)

    current_subject = None
    current_grade = None
    current_competency = None

    subjects = {}

    for i, para in enumerate(doc.paragraphs, 1):
        text = para.text.strip()
        if not text:
            continue

        # 检测学科标题（一、二、三、等）
        if text.startswith(('一、', '二、', '三、', '四、', '五、', '六、', '七、', '八、', '九、', '十、')):
            current_subject = text
            subjects[current_subject] = {
                'grades': {},
                'paragraph': i
            }
            current_grade = None
            current_competency = None
            print(f"\n{'='*60}")
            print(f"学科: {current_subject} (段落{i})")

        # 检测年级/学段（数字开头或括号开头）
        elif current_subject and (text.startswith(('1. ', '2. ', '3. ', '4. ', '（一）', '（二）', '（三）', '（四）'))):
            current_grade = text
            if current_grade not in subjects[current_subject]['grades']:
                subjects[current_subject]['grades'][current_grade] = {
                    'competencies': [],
                    'paragraph': i
                }
            print(f"  年级/学段: {current_grade} (段落{i})")
            current_competency = None

        # 检测核心素养（数字开头或括号开头，但不是年级/学段）
        elif current_grade and (text.startswith(('1. ', '2. ', '3. ', '4. ', '5. ', '6. ', '7. ', '8. ', '（一）', '（二）', '（三）', '（四）', '（五）', '（六）', '（七）', '（八）'))):
            current_competency = text
            subjects[current_subject]['grades'][current_grade]['competencies'].append({
                'name': current_competency,
                'paragraph': i
            })
            print(f"    核心素养: {current_competency} (段落{i})")

    return subjects

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python analyze_structure.py <file_path>")
        sys.exit(1)

    file_path = sys.argv[1]
    subjects = analyze_structure(file_path)

    print(f"\n\n{'='*60}")
    print("总结:")
    print(f"{'='*60}")
    for subject, data in subjects.items():
        print(f"\n{subject}:")
        for grade, grade_data in data['grades'].items():
            print(f"  {grade}: {len(grade_data['competencies'])} 个核心素养")
            for comp in grade_data['competencies']:
                print(f"    - {comp['name']}")
