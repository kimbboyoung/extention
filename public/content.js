// 지마켓 이미지 URL을 가져오는 부분
let srcList = [];
// 쿠팡 이미지 URL을 가져오는 부분
let coupangList = [];
let combinedText = "";
let dataCollected = false; // 크롤링 데이터를 수집한지 여부를 나타내는 플래그

const getAllCoupangImages = () => {
  if (dataCollected) {
    // 이미 데이터를 수집한 경우 다시 크롤링하지 않도록 반환
    return;
  }

  // 지마켓
  const iframes = document?.querySelectorAll("iframe");
  console.log("지마켓 크롤링");

  const itemTopInfo = document?.querySelector(".item-topinfo");
  if (itemTopInfo) {
    //상품 제목
    const h1Element = itemTopInfo.querySelector("h1");
    const h1Text = h1Element.textContent.trim();

    //원산지
    const itemMade = itemTopInfo
      .querySelector(".box__item-made")
      .textContent.trim();
    console.log("원산지 : ", itemMade);

    //가격 정보
    const priceTextArray = [];
    const priceDivs = itemTopInfo.querySelector(".price"); // "price" 클래스를 가진 div 요소들 선택
    const priceSubElements = priceDivs.querySelectorAll("span"); // 해당 div의 모든 하위 태그 선택
    priceSubElements.forEach((subElement) => {
      const text = subElement.textContent.trim(); // 각 하위 태그의 텍스트 추출하고 공백 제거
      priceTextArray.push(text);
    });
    const priceTexts = priceTextArray.join(" ").trim();
    //console.log("Price Texts:", priceTexts);

    //배송 정보
    const shipTextArray = [];
    const shippingFeeElements =
      itemTopInfo.querySelectorAll(".box__information");
    shippingFeeElements.forEach((shippingFeeElement) => {
      const shippingInforms = shippingFeeElement.querySelectorAll("span");
      shippingInforms.forEach((subElement) => {
        const text = subElement.textContent.trim(); // 각 하위 태그의 텍스트 추출하고 공백 제거
        shipTextArray.push(text);
      });
    });

    const shippingTexts = shipTextArray.join(" ").trim();
    //console.log("shippingTexts:", shippingTexts);

    // 텍스트를 줄바꿈 문자('\n')로 연결
    combinedText = [itemMade, h1Text, priceTexts, shippingTexts]
      .join("\n")
      .trim();
    //console.log("combinedText:", combinedText);
  }

  if (iframes.length > 0) {
    for (let i = 0; i < iframes.length; i++) {
      const iframe = iframes[i];
      //console.log("iframe : ", iframe);
      try {
        const contentDoc = iframe.contentDocument;
        if (contentDoc) {
          // "basic_detail_html" ID를 가진 요소 선택
          const basicDetailHtmlElement =
            contentDoc.querySelector("#basic_detail_html");
          if (basicDetailHtmlElement) {
            // "basic_detail_html" ID를 가진 요소 아래에 있는 img 태그 선택
            const innerImages = basicDetailHtmlElement.querySelectorAll("img");
            console.log("innerImages: " + innerImages.length);
            innerImages.forEach((img) => {
              if (!img.src.endsWith(".gif")) {
                srcList.push(img.src);
              }
            });
            console.log("srcList: " + srcList.length);

            const spanTexts = basicDetailHtmlElement.querySelectorAll("span");
            const spanTextArray = [];

            spanTexts.forEach((span) => {
              const text = span.textContent.trim(); // span 태그 안의 텍스트 추출하고 공백 제거
              spanTextArray.push(text);
            });

            combinedText += spanTextArray.join("\n");

            const textsInIframe = basicDetailHtmlElement.querySelectorAll("P");
            textsInIframe.forEach((text) => {
              combinedText += text.textContent.trim();
            });
            // 작업이 완료되면 반복문 종료
            break;
          }
        }
      } catch (e) {
        console.warn("Error accessing iframe contents:", e);
      }
    }

    console.log("combinedText : ", combinedText);
  }

  // 쿠팡
  coupangList = []; // coupangList 초기화
  //const coupangImgBoxs = document.querySelectorAll(".subType-IMAGE");
  const coupangImgBoxs = document.querySelectorAll(
    ".product-detail-content-inside"
  );

  if (coupangImgBoxs.length > 0) {
    //console.log("coupangImgBoxs", coupangImgBoxs);
    coupangImgBoxs?.forEach((imgBox) => {
      try {
        const innerImages = imgBox.querySelectorAll("img");
        innerImages.forEach((img) => {
          if (!img.src.endsWith(".gif")) {
            coupangList.push(img.src);
          }
        });
      } catch (e) {
        console.warn("Error accessing iframe contents:", e);
      }
    });
    // 1. "prod-buy" 태그 선택
    const prodBuyElement = document.querySelector(".prod-buy");

    if (prodBuyElement) {
      // 2. h2 태그 내의 텍스트 추출
      const h2Element = prodBuyElement.querySelector("h2");
      const h2Text = h2Element.textContent.trim();

      // 3. "total-price", "prod-shipping-fee-message", "prod-reward-cash-container" 클래스를 가진 하위 요소 선택
      const totalPriceElement = prodBuyElement.querySelector(".total-price");
      const shippingFeeElement = prodBuyElement.querySelector(
        ".prod-shipping-fee-message"
      );
      const rewardCashContainerElement =
        prodBuyElement.querySelector(".prod-reward-cash");
      const rewards = rewardCashContainerElement.querySelectorAll("p");
      const rewardsTextArray = Array.from(rewards).map((reward) =>
        reward.textContent.trim()
      );
      const combinedRewardsText = rewardsTextArray.join("\n");

      // 텍스트 추출
      const totalPriceText = totalPriceElement.textContent.trim();
      const shippingFeeText = shippingFeeElement.textContent.trim();
      //const rewardCashText = combinedRewardsText.textContent.trim();

      // 텍스트를 줄바꿈 문자('\n')로 연결
      combinedText = [
        h2Text,
        totalPriceText,
        shippingFeeText,
        combinedRewardsText,
      ].join("\n");
      //console.log("combinedText:", combinedText);
    }
  }

  // 크롤링 데이터를 수집한 후 플래그를 설정
  dataCollected = true;
};

// 현재 페이지의 URL 가져오기
const currentURL = window.location.href;

setTimeout(() => {
  // 크롤링 작업을 한 번만 수행
  getAllCoupangImages();

  // 메시지를 보내기
  sendCrawledDataToBackground();
}, 2000);

// 메시지를 백그라운드 스크립트로 보내는 함수
const sendCrawledDataToBackground = () => {
  // 이미지 URL과 텍스트 정보를 가지고 메시지를 보냅니다
  chrome.runtime.sendMessage({
    action: "performTask",
    images: srcList,
    coupangs: coupangList,
    currentURL: currentURL,
    detailTexts: combinedText,
  });
};
