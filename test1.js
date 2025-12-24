// Mission 1 // Passed

function countOdds(low, high) {
    let n = (high - low) / 2;
    if ((low % 2) === 1 || (high % 2) === 1) n++;
    console.log(Math.floor(n));
};

countOdds(1, 100);
countOdds(1, 7);


// Mission 2 // 

// function twoSum(nums, target){
//     let resultNum;
//     let iIndex = 0;
//     let nIndex = 0; 
//     nums.map((i) => {
//         nIndex = 0;
//         console.log(i)
//         console.log(`iIndex: ${iIndex}\nnIndex: ${nIndex}`)
//         nums.map((n) => {
//             let r = i + n;
//             console.log(n)
//             if (r === target && iIndex !== nIndex) resultNum = [nIndex, iIndex]
//             nIndex++;
//         })
//         iIndex++;
//     })
//     console.log(resultNum)
// };


 
// twoSum([-1, -2, -3], -4);