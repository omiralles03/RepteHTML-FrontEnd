async function scrap(){
    for(let i = 1; i <= 3; i++){
        const res = await fetch(`https://dokkan.fyi/characters?page=${i}`);
        const html = await res.text();
        console.log(html);
    }
}

scrap();