from pathlib import Path
from collections import defaultdict
import argparse, random, shutil
import cv2
import yaml

CLASSES = ['open', 'short', 'mousebite', 'spur', 'copper', 'pin-hole']

def convert(raw: Path, out: Path, seed=42):
    candidates=[]
    for img in raw.rglob('*_test.jpg'):
        label=img.parent.parent / (img.parent.name + '_not') / img.name.replace('_test.jpg', '.txt')
        if label.exists():
            candidates.append((img,label))
    if not candidates:
        raise RuntimeError('No matching _test.jpg / .txt files found inside '+str(raw))
    groups=defaultdict(list)
    for im, lab in candidates:
        # Group by board group when present, avoids neighboring views leaking across splits.
        relative=im.relative_to(raw)
        group=relative.parts[0] if len(relative.parts)>1 else im.stem
        groups[group].append((im,lab))
    keys=sorted(groups)
    rng=random.Random(seed)
    rng.shuffle(keys)
    if len(keys)<3:
        raise RuntimeError('Need 3 or more independent groups for group-based train/val/test split.')
    n=len(keys); ntest=max(1,round(n*.15)); nval=max(1,round(n*.15))
    if n-ntest-nval<1: raise RuntimeError('Not enough groups')
    split_keys={'test':keys[:ntest],'val':keys[ntest:ntest+nval],'train':keys[ntest+nval:]}
    counts={}
    for split, selected in split_keys.items():
        imagesdir=out/'images'/split; labelsdir=out/'labels'/split
        imagesdir.mkdir(parents=True,exist_ok=True); labelsdir.mkdir(parents=True,exist_ok=True)
        total=0
        for g in selected:
            for im, lab in groups[g]:
                arr=cv2.imread(str(im))
                if arr is None: raise ValueError(f'Unreadable image: {im}')
                h,w=arr.shape[:2]; converted=[]
                for line_no,line in enumerate(lab.read_text(encoding='utf-8-sig').splitlines(),1):
                    if not line.strip(): continue
                    fields=line.replace(',',' ').split()
                    if len(fields)!=5: raise ValueError(f'Invalid annotation at {lab}:{line_no}: {line}')
                    x1,y1,x2,y2,cls=(int(float(a)) for a in fields)
                    if not(1<=cls<=6 and 0<=x1<x2<=w and 0<=y1<y2<=h):
                        raise ValueError(f'Invalid coordinates or class at {lab}:{line_no}: {line}')
                    cx=(x1+x2)/(2*w);cy=(y1+y2)/(2*h);bw=(x2-x1)/w;bh=(y2-y1)/h
                    converted.append(f'{cls-1} {cx:.8f} {cy:.8f} {bw:.8f} {bh:.8f}')
                # use group prefix to protect against colliding basenames
                dest=f'{g}_{im.stem}'
                shutil.copy2(im,imagesdir/f'{dest}.jpg')
                (labelsdir/f'{dest}.txt').write_text('\n'.join(converted)+ ('\n' if converted else ''),encoding='utf8')
                total+=1
        counts[split]={'images':total,'groups':len(selected)}
    config={'path':str(out.resolve()),'train':'images/train','val':'images/val','test':'images/test','names':dict(enumerate(CLASSES))}
    (out/'data.yaml').write_text(yaml.safe_dump(config,sort_keys=False),encoding='utf8')
    print('Dataset ready:',out.resolve());print('Split counts:',counts)
    print('Config:',out/'data.yaml')

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--raw',type=Path,default=Path('DeepPCB/PCBData'));p.add_argument('--out',type=Path,default=Path('dataset'));p.add_argument('--seed',type=int,default=42)
    a=p.parse_args();convert(a.raw,a.out,a.seed)
