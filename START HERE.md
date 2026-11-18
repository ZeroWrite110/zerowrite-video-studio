# AI Video Studio: kaise use karein

## Har video ke 3 qadam

1. `Raw` mein video ke naam ka folder banayein, jaise `Raw/2026-11-18-msp-tips/`
2. Us mein apni clip(s) dalein, aur `brief.txt` bharein (`Raw/_example-video-name/brief.txt` copy kar lein)
3. VS Code mein Claude se kahein: **"edit Raw/2026-11-18-msp-tips"**

Tayyar video Desktop par **Completed Video** folder mein aayegi (`2026-11-18-msp-tips.mp4`). Captions file aur notes `Export/2026-11-18-msp-tips/` mein rehte hain.
Pasand aaye to `Approved Videos` mein daal dein. Na aaye to Claude ko bataein kya badalna hai.

## Baqi folders

| Folder | Kya dalein |
|---|---|
| `Editing Style` | Aap ki editing ke usool, jaise `style.md`. Claude har edit se pehle parhta hai |
| `Brand Kit` | Logo, rang (`colors.txt`), fonts, music |
| `Reference` | Doosron ki videos jin ka style pasand hai |
| `Approved Videos` | Aap ki pasand ki hui apni videos |
| `studio` | Engine. Ise haath lagane ki zaroorat nahi |

## Claude video mein kya karta hai

1. Folder mein kai clips hon to unhein naam ki tarteeb se jodta hai
2. Shuru, beech aur aakhir ki khamoshi kaat deta hai (jump cuts). Bina awaz wali clips (b-roll) nahi katti
3. Whisper AI se bolay gaye alfaaz sunta hai, muft aur isi computer par
4. Word-by-word captions lagata hai, aur bolay ja rahe lafz ko highlight karta hai
5. Shuru mein bada hook title lagata hai
6. Har cut par halka zoom karta hai, aur neeche progress bar lagata hai
7. Size: 9:16 (Reels/TikTok/Shorts), 16:9 (YouTube) ya 1:1, jo brief mein likha ho

Footage ke baghair sirf text wali reel bhi ban sakti hai. Bas Claude se kahein: "5 tips ki text reel banao".

## Zabaan

Urdu, Hindi aur English, teeno chalti hain. Urdu/Hindi bol kar English captions bhi ban sakti hain. Brief mein likh dein.

## Waqt kitna lagta hai

- Alfaaz sunna (transcription): 1 minute ki video par takreeban 4-5 minute
- Render: 1 minute ki video par takreeban 1-2 minute

## Sample

`Raw/sample-talking` aur `Export/sample-talking` sirf demo hain (AI awaz). Inhein delete kar sakte hain.
