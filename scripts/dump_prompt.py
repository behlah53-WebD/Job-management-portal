import json

with open(r'C:\Users\Murtaza\.gemini\antigravity\brain\482d1c4e-2a33-4fdb-b50e-01b0330ed699\.system_generated\logs\transcript_full.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        if '"step_index":2232' in line:
            obj = json.loads(line)
            with open('step_2232_content.txt', 'w', encoding='utf-8') as out:
                out.write(obj.get('content', ''))
            print('Written step_2232_content.txt, length:', len(obj.get('content', '')))
            break
