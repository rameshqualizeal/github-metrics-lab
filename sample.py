"""Sample Python script demonstrating common language features."""


def greet(name: str) -> str:
    """Return a greeting message for the given name."""
    return f"Hello, {name}!"


def fibonacci(n: int) -> list[int]:
    """Return the first n Fibonacci numbers."""
    sequence = []
    a, b = 0, 1
    for _ in range(n):
        sequence.append(a)
        a, b = b, a + b
    return sequence


class Counter:
    """A simple counter class."""

    def __init__(self, start: int = 0) -> None:
        self.value = start

    def increment(self, step: int = 1) -> int:
        self.value += step
        return self.value


def main() -> None:
    print(greet("World"))

    print("First 10 Fibonacci numbers:", fibonacci(10))

    counter = Counter()
    counter.increment()
    counter.increment(5)
    print("Counter value:", counter.value)

    squares = [x**2 for x in range(1, 6)]
    print("Squares of 1-5:", squares)

    data = {"language": "Python", "year": 1991}
    for key, value in data.items():
        print(f"{key}: {value}")


if __name__ == "__main__":
    main()
