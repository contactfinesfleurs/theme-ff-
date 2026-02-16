
if(!Shopify.designMode){
  const productRecommendationsSection = document.querySelector('.product-recommendations');

const handleIntersection = (entries, observer) => {
    if (!entries[0].isIntersecting) return; 

    observer.unobserve(productRecommendationsSection);

    const url = productRecommendationsSection.dataset.url;

    fetch(url)
      .then(response => response.text())
      .then(text => {
        const html = document.createElement('div');
        html.innerHTML = text;
        const recommendations = html.querySelector('.product-recommendations');

        if (recommendations && recommendations.innerHTML.trim().length) {
          productRecommendationsSection.innerHTML = recommendations.innerHTML;
        }
      })
      .catch(e => {
        console.error(e);
      });
  };


  const observer = new IntersectionObserver(handleIntersection, {rootMargin: '0px 0px 200px 0px'});

  observer.observe(productRecommendationsSection);

}
else{
  const productRecommendationsSection = document.querySelector('.product-recommendations');


  document.addEventListener('shopify:section:load', function(event){

    const prs = document.querySelector('.product-recommendations');


    const url = productRecommendationsSection.dataset.url;

    fetch(url)
      .then(response => response.text())
      .then(text => {
        const html = document.createElement('div');
        html.innerHTML = text;
        const recommendations = html.querySelector('.product-recommendations');


        if (recommendations && recommendations.innerHTML.trim().length) {
          prs.innerHTML = recommendations.innerHTML;
        }
      })
      .catch(e => {
      });
  });


      const url = productRecommendationsSection.dataset.url;

    fetch(url)
      .then(response => response.text())
      .then(text => {
        const html = document.createElement('div');
        html.innerHTML = text;
        const recommendations = html.querySelector('.product-recommendations');

        if (recommendations && recommendations.innerHTML.trim().length) {
          productRecommendationsSection.innerHTML = recommendations.innerHTML;
        }
      })
      .catch(e => {
      });
  
}
