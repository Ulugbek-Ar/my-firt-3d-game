"""Original deterministic surface art. Run with Python + Pillow to regenerate.
No external photos, fonts, models or copyrighted source images are used.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageChops
from pathlib import Path
import random, math
OUT = Path(__file__).resolve().parents[1] / 'public/textures'
OUT.mkdir(parents=True, exist_ok=True)
S = 256
NAMES = ['stone','brick','timber','planks','cobble','mud','moss','ground','slate','metal','runes','needles','cloth','plaster','bark','leather']

def tile(name, index):
    r = random.Random(301 + index)
    im = Image.new('RGB', (S,S), (178,178,166)); d = ImageDraw.Draw(im)
    def rect(bounds, c): d.rectangle(bounds, fill=c)
    if name=='stone':
        im.paste((174,181,171),(0,0,S,S));d=ImageDraw.Draw(im)
        for _ in range(55):
            x,y=r.randrange(-20,256),r.randrange(-20,256);radius=r.randrange(6,30);v=r.randrange(153,192)
            points=[(x+math.cos(a)*radius*r.uniform(.5,1.2),y+math.sin(a)*radius*r.uniform(.5,1.2)) for a in [i*math.pi/4 for i in range(8)]]
            d.polygon(points,fill=(v,v+5,v-2))
        for _ in range(9):
            x,y=r.randrange(S),r.randrange(S);points=[(x,y)]
            for j in range(r.randrange(3,7)):x+=r.randrange(-12,20);y+=r.randrange(8,23);points.append((x,y))
            d.line(points,fill=(103,119,108),width=1)
            d.line([(x+2,y-1) for x,y in points],fill=(204,209,192),width=1)
        for _ in range(100):
            x,y=r.randrange(S),r.randrange(190,256)
            d.ellipse((x,y,x+3,y+2),fill=(137,159,112))
    elif name in ['brick','cobble','runes']:
        im.paste((73,82,79), (0,0,S,S)); d = ImageDraw.Draw(im)
        rows = 4 if name != 'brick' else 7
        height = S // rows
        for row in range(-1, rows+1):
            width = 86 if name != 'brick' else 65
            for col in range(-1,5):
                x = col*width+(row%2)*width//2; y=row*height
                v = r.randint(147,191); box=(x+3,y+3,x+width-3,y+height-3)
                d.rounded_rectangle(box, radius=r.randint(3,8),fill=(v,v+3,v-4))
                d.line((x+6,y+6,x+width-9,y+6),fill=(v+21,v+24,v+15),width=2)
                d.line((x+width-5,y+12,x+width-5,y+height-7),fill=(v-35,v-30,v-32),width=3)
                for _ in range(5):
                    px=x+r.randrange(5,width-4);py=y+r.randrange(7,height-4)
                    d.line((px,py,px+r.randrange(-9,9),py+r.randrange(3,12)),fill=(v-30,v-25,v-27),width=1)
                if row%2==0:
                    for _ in range(20):
                        px=x+r.randrange(2,width);py=y+height-r.randrange(2,13)
                        d.ellipse((px,py,px+3,py+2),fill=(106,126,87))
        if name=='runes':
            # Chisel marks, not luminous paint: emissive rune strokes remain a separate mesh.
            for x in [44,122,205]:
                d.line((x,30,x,225),fill=(46,67,64),width=5)
                for y in [70,138,195]:
                    d.line((x-17,y-13,x+17,y+13),fill=(55,75,69),width=4)
                    d.line((x-17,y+13,x+17,y-13),fill=(55,75,69),width=3)
    elif name in ['timber','planks','bark','leather']:
        im.paste((169,159,134),(0,0,S,S));d=ImageDraw.Draw(im)
        width=64 if name=='planks' else 128
        for x in range(0,S,width):
            v=r.randrange(147,180);d.rectangle((x+2,0,x+width-2,S),fill=(v+8,v,v-18))
            d.line((x+2,0,x+2,S),fill=(78,77,65),width=3)
            d.line((x+5,0,x+5,S),fill=(211,199,167),width=2)
            for n in range(19):
                px=x+r.randrange(6,width-5)
                points=[(px+math.sin(y*.045+n)*r.randint(1,5),y) for y in range(-10,270,8)]
                d.line(points,fill=(v-28,v-30,v-34),width=r.choice([1,1,2]))
            for _ in range(2):
                nx=x+r.randrange(12,width-12);ny=r.randrange(35,220)
                d.ellipse((nx-5,ny-15,nx+5,ny+15),outline=(102,99,80),width=2)
                d.ellipse((nx-1,ny-7,nx+2,ny+7),fill=(92,90,73))
            if name=='planks':
                for y in [14,240]:
                    d.ellipse((x+10,y,x+15,y+5),fill=(66,75,71))
        if name=='leather':
            for y in range(3,255,8):d.line((12,y,12,y+4),fill=(220,205,168),width=2)
    elif name=='slate':
        im.paste((70,80,86),(0,0,S,S));d=ImageDraw.Draw(im)
        for row in range(-1,6):
            for col in range(-1,6):
                x=col*54+(row%2)*27;y=row*54;v=r.randrange(140,189)
                d.rounded_rectangle((x+2,y+1,x+52,y+52),radius=4,fill=(v-3,v+2,v+6))
                d.line((x+5,y+49,x+48,y+49),fill=(73,85,91),width=3)
                d.line((x+4,y+5,x+4,y+43),fill=(v+18,v+20,v+20),width=1)
                d.line((x+17,y+10,x+14,y+30,x+21,y+43),fill=(v-15,v-12,v-10),width=1)
    elif name=='metal':
        im.paste((154,166,160),(0,0,S,S));d=ImageDraw.Draw(im)
        for _ in range(220):
            x,y=r.randrange(S),r.randrange(S);s=r.randrange(1,9)
            d.ellipse((x,y,x+s,y+s),fill=r.choice([(147,135,111),(117,129,120),(178,183,166)]))
        for x in [8,245]:
            for y in [8,245]:d.ellipse((x-3,y-3,x+3,y+3),fill=(216,213,182))
    elif name=='cloth':
        for x in range(S):
            v=int(174+12*math.sin(x*.13)+17*math.cos(x*.032))
            d.line((x,0,x,S),fill=(v+8,v,v-4))
        for y in range(0,S,3):d.line((0,y,S,y),fill=(151,149,137))
        for y in range(4,256,8):d.line((8,y,8,y+4),fill=(227,214,176),width=2)
        d.line((20,238,110,238,128,212,145,238,236,238),fill=(222,207,171),width=3)
    elif name=='plaster':
        im.paste((206,201,180),(0,0,S,S));d=ImageDraw.Draw(im)
        for _ in range(90):
            x,y=r.randrange(S),r.randrange(S);s=r.randrange(1,16)
            d.polygon([(x+math.cos(i*math.pi/4)*s*r.uniform(.5,1),y+math.sin(i*math.pi/4)*s*r.uniform(.5,1)) for i in range(8)],fill=r.choice([(191,190,170),(213,209,187),(174,179,159)]))
        d.line((54,0,63,48,57,83,73,122),fill=(135,143,126),width=1)
        d.line((63,48,80,64,86,101),fill=(155,158,140),width=1)
    else:
        bases={'mud':(149,143,119),'moss':(165,179,130),'ground':(167,173,143),'needles':(173,187,166)}
        base=bases.get(name,(170,170,155));im.paste(base,(0,0,S,S));d=ImageDraw.Draw(im)
        for _ in range(1900):
            x,y=r.randrange(S),r.randrange(S);v=r.randrange(-35,25);c=tuple(max(0,min(255,b+v)) for b in base)
            if name=='needles':d.line((x,y,x+r.randrange(-12,12),y+r.randrange(5,21)),fill=c,width=1)
            elif name=='mud':d.line((x,y,x+r.randrange(2,14),y+r.randrange(-2,3)),fill=c,width=1)
            else:d.ellipse((x,y,x+r.randrange(1,7),y+r.randrange(1,4)),fill=c)
        if name=='ground':
            for _ in range(90):
                x,y=r.randrange(S),r.randrange(S)
                d.polygon([(x,y),(x+8,y+2),(x+12,y+6),(x+3,y+5)],fill=(119,126,100))
    # Low-amplitude grain adds painterly surface detail without high contrast shimmer.
    noise=Image.frombytes('L',(S,S),bytes(r.randint(105,151) for _ in range(S*S))).convert('RGB')
    im=Image.blend(im,noise,.1)
    # Duplicate 4px gutters for safe bilinear sampling inside the atlas.
    content=im.crop((4,4,252,252));im.paste(content,(4,4))
    im.paste(im.crop((4,4,5,252)).resize((4,248)),(0,4));im.paste(im.crop((251,4,252,252)).resize((4,248)),(252,4))
    im.paste(im.crop((0,4,256,5)).resize((256,4)),(0,0));im.paste(im.crop((0,251,256,252)).resize((256,4)),(0,252))
    return im

atlas=Image.new('RGB',(1024,1024))
for i,name in enumerate(NAMES):
    texture=tile(name,i);atlas.paste(texture,((i%4)*S,(i//4)*S))
    if name in ['ground','mud']: texture.resize((128,128),Image.Resampling.LANCZOS).save(OUT/(name+'.png'),optimize=True)
atlas.quantize(colors=128).save(OUT/'asterfall-atlas.png',optimize=True)
print('Generated:',[(p.name,p.stat().st_size) for p in OUT.glob('*.png')])
