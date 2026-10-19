def calculate_total(a, b):
    return a + b


def calculate_product(a, b):
    return a * b


def format_metrics_summary(total, product):
    return f"total={total}, product={product}"


if __name__ == "__main__":
    a, b = 10, 20
    total = calculate_total(a, b)
    product = calculate_product(a, b)
    print(format_metrics_summary(total, product))
