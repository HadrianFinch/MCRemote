const f = (sel) =>
{
    const obj = document.querySelector(sel);
    f.addFtoElm(obj);
    return obj;
};
f.addFtoElm = (obj) =>
{
    obj.f = {
        NewChild: (tag, classes = []) =>
        {
            const c = f.New(tag, classes);
            obj.appendChild(c);
            return c;   
        },
        on: (evt, hdlr) =>
        {
            obj.addEventListener(evt, hdlr);
        }
    }
    return obj;
}
f.FindAll = (sel) =>
{
    const res = document.querySelectorAll(sel);
    for (let i = 0; i < res.length; i++)
    {
        const elm = res[i];
        f.addFtoElm(elm);
    }
    return res;
}
f.DeleteAllChildren = (obj) => 
{
    while (obj.firstChild)
    {
        obj.firstChild.remove();
    }
}
f.New = (tag, classes = []) =>
{
    const n = document.createElement(tag);
    for (let i = 0; i < classes.length; i++)
    {
        const c = classes[i];
        
        n.classList.add(c);
    }
    f.addFtoElm(n);
    return n;
}
f.storage = 
{
    Save: (obj, name) =>
    {
        localStorage.setItem(name, JSON.stringify(obj));
    },
    Load: (name) =>
    {
        return JSON.parse(localStorage.getItem(name));
    }
}
f.scrollmagic = 
{
    Init: () =>
    {
        window.addEventListener('scroll', () => 
        {
            document.body.style.setProperty('--scroll', window.pageYOffset / (document.body.offsetHeight - window.innerHeight));
        }, false);
        window.addEventListener('mousemove', (e) => 
        {
            document.body.style.setProperty('--mouse-x', e.clientX + "px");
            document.body.style.setProperty('--mouse-y', e.clientY + "px");
        }, false);
    }
}