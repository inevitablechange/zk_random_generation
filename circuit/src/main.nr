use dep::std::hash::poseidon2::Poseidon2;

fn main(
    commitment: pub Field, // public input (commitment)
    min_age: pub u8,       // public input (minimum age)
    age: Field,            // private input (actual age)
    nonce: Field           // private input (salt, random value)
) {
    // recompute commitment hash
    let hash = Poseidon2::hash([age, nonce],2);
    // commitment must match
    println(hash);
    assert(commitment == hash, "Commitment mismatch");
    // age condition must be satisfied

    let age_u32 = age as u32;
    let min_age_u32 = min_age as u32;
    assert(age_u32 >= min_age_u32, "Age check failed");
}

#[test]
fn test_hash() {
    let age = 29; 
    let nonce = 100; 
    let commitment = Poseidon2::hash([age, nonce], 2);

    std::println(f"age={age}");
    std::println(f"nonce={nonce}");
    std::println(f"COMMITMENT_VALUE={commitment}");
}