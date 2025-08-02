global N: u32 = 16;
global M: u32 = 8;

use dep::std::hash::poseidon2::Poseidon2;

fn main(
    candidates: [Field; N],
    pick_count: pub u32,
    user_seed: pub Field
) -> pub [Field; M] {
    // Clamp pick_count to [1, M] and no more than N
    let effective_count = if pick_count > M { M }
        else if pick_count < 1 { 1 }
        else { pick_count };

    // Fisher-Yates shuffle using Poseidon2 as deterministic RNG
    let mut shuffled = candidates;
    let mut seed = user_seed;

    for i in 0..N {
        // Deterministic hash for randomness: each step's output is new seed
        let rnd = Poseidon2::hash([seed, i.into()], 1);
        let j = (rnd as u32) % (N - i) + i;
        // Swap shuffled[i] <-> shuffled[j]
        let temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
        seed = rnd;
    }

    // Pick the first 'effective_count' elements, pad with 0 up to M
    let mut result: [Field; M] = [0; M];
    for k in 0..M {
        if k < effective_count {
            result[k] = shuffled[k];
        } else {
            result[k] = 0;
        }
    }
    result
}

#[test]
fn test_random_picker() {
    let cands: [Field; 16] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
    let pick: u32 = 3;
    let seed: Field = 42;
    let result: [Field; 8] = main(cands, pick, seed);
    std::println(result);   
    std::println(result[0]);
}
