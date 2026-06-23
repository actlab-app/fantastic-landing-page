# Fantastic Landing Page

ACTLab.app icin hazirlanan, katmanli fantastik sahne animasyonuna sahip statik landing page.

## Ozellikler

- Katmanli hero sahnesi: arka plan, on plan ve en on plan ayri WebP katmanlariyla calisir.
- Scroll tabanli sahne akisi: masaustunde gorsel katmanlar yukaridan asagi kayar, hero content sahneden cikar, zoom-out fazi tamamlanir ve newsletter formu yukari gelir.
- Mobil/dikey hafif mod: dikey cihazlarda agir pan/zoom fazlari kapatilir; akis iki faza duser: hero content kaybolur, form gelir.
- Responsive gorsel seti: 1080p, 2K, 4K ve tam boy WebP varliklari `picture/srcset` ile cihaza gore secilir.
- Katman ustu animasyonlar: zeplin animasyonlari masaustunde sahneye derinlik katar, mobil/dikey cihazlarda performans icin kapatilir.
- Explorer karakteri: `explorer-act.webp`, en on plan katmanina bagli sekilde ayni transform duzleminde hareket eder.
- Geri sayim paneli: acilis tarihi JavaScript icindeki `LAUNCH_DATE` sabitiyle ayarlanir.
- Newsletter karti: scroll sonunda sabit sahnenin uzerine yukselen genis kart yapisi.

## Dosya Yapisi

```text
.
├── index.html
├── assets/
│   ├── styles.css
│   └── main.js
└── img/
    ├── actlogo.webp
    ├── explorer-act.webp
    ├── bg_imgs/
    │   ├── 1080p/
    │   ├── 2k/
    │   ├── 4k/
    │   ├── genis_fantastik_arkaplan.webp
    │   ├── genis_fantastik_onplan.webp
    │   └── genis_fantastik_en_onplan.webp
    └── old_bgs/
```

## Katmanli Sahne Mantigi

Hero alani uc ana gorsel katmanindan olusur:

- `genis_fantastik_arkaplan.webp`: gokyuzu ve uzak sahne.
- `genis_fantastik_onplan.webp`: ana vadi/on plan katmani.
- `genis_fantastik_en_onplan.webp`: metinlerin ve karakterin onunde kalan en on katman.

Katmanlar ayni odak noktasi ve yatay olcek uzerinden hesaplanir. Temel ayarlar `assets/styles.css` icindeki `.hero` degiskenlerinden yapilir:

```css
--hero-horizontal-scale: 200%;
--hero-focus-x: 47%;
--explorer-x: 44%;
--explorer-y: 86%;
--explorer-width: 7.5%;
```

## Animasyon Akisi

Scroll akisi `assets/main.js` icindeki faz oranlariyla kontrol edilir:

```js
const contentExitScrollRatio = 0.42;
const zoomOutScrollRatio = 0.48;
const newsletterRevealScrollRatio = 0.48;
const newsletterStart = 0.2;
```

Masaustu akis:

1. Katmanli sahne yukaridan asagi pan yapar.
2. Hero content sahneden asagi cikar.
3. Sahne zoom-out olur.
4. Newsletter formu yukari gelir.

Mobil/dikey akis:

1. Hero content sahneden cikar.
2. Newsletter formu gelir.

## Performans Notlari

- WebP formatli farkli cozunurlukler kullanilir.
- `picture` ve `srcset` ile tarayici uygun gorseli secer.
- Mobil ve portrait modda agir pan/zoom ve zeplin animasyonlari kapatilir.
- Transform animasyonlari `translate3d` ve CSS custom property uzerinden calisir.
- Katman genisligi her frame'de degil, ilk yukleme ve resize/orientation degisiminde hesaplanir.

## Calistirma

Bu proje statik HTML/CSS/JS yapisindadir. Yerel sunucu zorunlu degildir; `index.html` dosyasi tarayicida acilabilir.

PHP/Apache/Nginx gibi bir yerel sunucuda yayinlamak icin proje kok dizinini document root olarak kullanmak yeterlidir.

## GitHub

Hedef repo:

```text
https://github.com/actlab-app/fantastic-landing-page.git
```

Ilk yukleme icin:

```bash
git add .
git commit -m "Initial fantastic landing page"
git push -u origin main
```
